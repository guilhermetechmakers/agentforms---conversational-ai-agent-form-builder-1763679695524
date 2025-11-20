import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StepProgress } from "@/components/agent-builder/StepProgress";
import { SchemaEditor } from "@/components/agent-builder/SchemaEditor";
import { PersonaSettings } from "@/components/agent-builder/PersonaSettings";
import { KnowledgeInput } from "@/components/agent-builder/KnowledgeInput";
import { VisualSettings } from "@/components/agent-builder/VisualSettings";
import { PreviewPanel } from "@/components/agent-builder/PreviewPanel";
import { PublishSettings } from "@/components/agent-builder/PublishSettings";
import { useAgent, useCreateAgent, useUpdateAgent } from "@/hooks/useAgents";
import { useDebounce } from "@/hooks/useDebounce";
import { ArrowLeft, ArrowRight, Save, Eye, Loader2 } from "lucide-react";

const STEPS = [
  { id: "schema", label: "Schema", description: "Define fields" },
  { id: "persona", label: "Persona", description: "Set behavior" },
  { id: "knowledge", label: "Knowledge", description: "Add context" },
  { id: "visuals", label: "Visuals", description: "Customize appearance" },
  { id: "publish", label: "Publish", description: "Configure sharing" },
];

const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required"),
  schema: z.object({
    fields: z.array(
      z.object({
        id: z.string(),
        label: z.string().min(1, "Field label is required"),
        type: z.enum(["text", "number", "email", "select", "date", "file"]),
        required: z.boolean(),
        order: z.number(),
        placeholder: z.string().optional(),
        helpText: z.string().optional(),
        options: z.array(z.string()).optional(),
        validation: z.any().optional(),
        piiFlag: z.boolean().optional(),
      })
    ),
  }),
  persona: z.object({
    name: z.string().min(1, "Persona name is required"),
    description: z.string().min(1, "Persona description is required"),
    tone: z.enum(["friendly", "professional", "casual", "formal"]),
    sampleMessages: z.array(z.string()).optional(),
  }),
  knowledge: z
    .object({
      content: z.string(),
      enableRAG: z.boolean(),
      maxContextTokens: z.number().optional(),
      citationFlag: z.boolean().optional(),
    })
    .optional(),
  visuals: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
    avatarUrl: z.string().optional(),
    logoUrl: z.string().optional(),
    welcomeMessage: z.string().min(1, "Welcome message is required"),
    customCSS: z.string().optional(),
  }),
  publish: z.object({
    slug: z.string().min(1, "URL slug is required"),
    publicUrl: z.string(),
    emailOTPEnabled: z.boolean(),
    webhookUrl: z.string().optional(),
    webhookSecret: z.string().optional(),
    retentionDays: z.number().optional(),
  }),
});

type AgentFormData = z.infer<typeof agentSchema>;

export default function AgentBuilder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const { data: existingAgent, isLoading: isLoadingAgent } = useAgent(id || "");
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: "",
      schema: { fields: [] },
      persona: {
        name: "",
        description: "",
        tone: "friendly",
        sampleMessages: [],
      },
      knowledge: undefined,
      visuals: {
        primaryColor: "#4F46E5",
        welcomeMessage: "",
      },
      publish: {
        slug: "",
        publicUrl: "",
        emailOTPEnabled: false,
      },
    },
  });

  const formData = watch();

  // Load existing agent data
  useEffect(() => {
    if (existingAgent && isEditing) {
      setValue("name", existingAgent.name);
      setValue("schema", existingAgent.schema);
      setValue("persona", existingAgent.persona);
      setValue("knowledge", existingAgent.knowledge || undefined);
      setValue("visuals", existingAgent.visuals);
      setValue("publish", existingAgent.publish);
    }
  }, [existingAgent, isEditing, setValue]);

  // Autosave draft
  const debouncedFormData = useDebounce(formData, 2000);
  const autosaveEnabled = isEditing && isDirty && !isSaving;

  const handleAutosave = useCallback(async () => {
    if (!id || !debouncedFormData.name) return;

    setIsSaving(true);
    try {
      await updateAgent.mutateAsync({
        id,
        updates: {
          name: debouncedFormData.name,
          schema: debouncedFormData.schema,
          persona: debouncedFormData.persona,
          knowledge: debouncedFormData.knowledge || null,
          visuals: debouncedFormData.visuals,
          publish: debouncedFormData.publish,
          status: "draft",
        },
      });
    } catch (error) {
      console.error("Autosave failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [id, debouncedFormData, updateAgent]);

  useEffect(() => {
    if (autosaveEnabled && debouncedFormData.name) {
      handleAutosave();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFormData]);

  const handleSaveDraft = async () => {
    if (!formData.name) {
      toast.error("Please enter an agent name");
      return;
    }

    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateAgent.mutateAsync({
          id,
          updates: {
            name: formData.name,
            schema: formData.schema,
            persona: formData.persona,
            knowledge: formData.knowledge || null,
            visuals: formData.visuals,
            publish: formData.publish,
            status: "draft",
          },
        });
      } else {
        const result = await createAgent.mutateAsync({
          user_id: "", // Will be set by API
          name: formData.name,
          schema: formData.schema,
          persona: formData.persona,
          knowledge: formData.knowledge || null,
          visuals: formData.visuals,
          publish: formData.publish,
          status: "draft",
        });
        navigate(`/agent/${result.id}/edit`);
      }
      toast.success("Draft saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (data: AgentFormData) => {
    setIsSaving(true);
    try {
      if (isEditing && id) {
        await updateAgent.mutateAsync({
          id,
          updates: {
            name: data.name,
            schema: data.schema,
            persona: data.persona,
            knowledge: data.knowledge || null,
            visuals: data.visuals,
            publish: data.publish,
            status: "published",
          },
        });
      } else {
        const result = await createAgent.mutateAsync({
          user_id: "", // Will be set by API
          name: data.name,
          schema: data.schema,
          persona: data.persona,
          knowledge: data.knowledge || null,
          visuals: data.visuals,
          publish: data.publish,
          status: "published",
        });
        navigate(`/agent/${result.id}/edit`);
      }
      toast.success("Agent published successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish agent");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  if (isLoadingAgent && isEditing) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1">
              {isEditing ? "Edit Agent" : "Create New Agent"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Build your conversational AI agent step by step
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Hide" : "Show"} Preview
            </Button>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>
        </div>

        {/* Step Progress */}
        <Card>
          <CardContent className="p-6">
            <StepProgress
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className={showPreview ? "lg:col-span-2" : "lg:col-span-3"}>
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(handlePublish)} className="space-y-6">
                  {/* Agent Name */}
                  <div className="space-y-2">
                    <label htmlFor="agent-name" className="text-sm font-semibold">
                      Agent Name *
                    </label>
                    <input
                      id="agent-name"
                      {...register("name")}
                      className="flex h-11 w-full rounded-lg border border-input bg-card px-3 py-2 text-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="My Agent"
                    />
                    {errors.name && (
                      <p className="text-sm text-danger">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Step Content */}
                  {currentStep === 0 && (
                    <SchemaEditor
                      fields={formData.schema.fields}
                      onChange={(fields) => setValue("schema.fields", fields)}
                    />
                  )}

                  {currentStep === 1 && (
                    <PersonaSettings
                      persona={formData.persona}
                      onChange={(persona) => setValue("persona", persona)}
                    />
                  )}

                  {currentStep === 2 && (
                    <KnowledgeInput
                      knowledge={formData.knowledge}
                      onChange={(knowledge) => setValue("knowledge", knowledge)}
                    />
                  )}

                  {currentStep === 3 && (
                    <VisualSettings
                      visuals={formData.visuals}
                      onChange={(visuals) => setValue("visuals", visuals)}
                    />
                  )}

                  {currentStep === 4 && (
                    <PublishSettings
                      publish={formData.publish}
                      onChange={(publish) => setValue("publish", publish)}
                      agentName={formData.name}
                    />
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSaveDraft}
                        disabled={isSaving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </Button>

                      {currentStep < STEPS.length - 1 ? (
                        <Button type="button" onClick={handleNext}>
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button type="submit" disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Publishing...
                            </>
                          ) : (
                            "Publish Agent"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="lg:col-span-1">
              <PreviewPanel
                schema={formData.schema}
                persona={formData.persona}
                visuals={formData.visuals}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
