import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PersonaSettings } from "@/components/agent-builder/PersonaSettings";
import { KnowledgeSnippetManager } from "@/components/persona-knowledge/KnowledgeSnippetManager";
import { PreviewPanel } from "@/components/agent-builder/PreviewPanel";
import { useAgent, useUpdateAgent } from "@/hooks/useAgents";
import { useAgents } from "@/hooks/useAgents";
import { ArrowLeft, Loader2, Save, Eye, ChevronRight, MessageSquare } from "lucide-react";
import type { AgentPersona } from "@/types/agent";

export default function PersonaKnowledgeConfig() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(agentId || null);
  const [activeTab, setActiveTab] = useState<"persona" | "knowledge">("persona");
  const [showPreview, setShowPreview] = useState(false);
  const [localPersona, setLocalPersona] = useState<AgentPersona | null>(null);

  const { data: agents, isLoading: isLoadingAgents } = useAgents();
  const { data: agent, isLoading: isLoadingAgent } = useAgent(selectedAgentId || "");
  const updateAgent = useUpdateAgent();

  // Set selected agent from URL param or first agent
  useEffect(() => {
    if (!selectedAgentId && agents && agents.length > 0) {
      setSelectedAgentId(agents[0].id);
    } else if (agentId) {
      setSelectedAgentId(agentId);
    }
  }, [agents, agentId, selectedAgentId]);

  // Sync local persona with agent data
  useEffect(() => {
    if (agent) {
      setLocalPersona(agent.persona);
    }
  }, [agent]);

  const handlePersonaChange = (persona: AgentPersona) => {
    setLocalPersona(persona);
  };

  const handleSave = async () => {
    if (!selectedAgentId || !localPersona) {
      toast.error("Please select an agent and configure persona");
      return;
    }

    try {
      await updateAgent.mutateAsync({
        id: selectedAgentId,
        updates: {
          persona: localPersona,
        },
      });
      toast.success("Configuration saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save configuration");
    }
  };

  if (isLoadingAgents) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-h2 mb-2">No Agents Found</h2>
              <p className="text-muted-foreground mb-6">
                Create an agent first to configure persona and knowledge settings
              </p>
              <Link to="/agent/new">
                <Button>
                  Create Your First Agent
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/dashboard" className="hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Persona & Knowledge</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1">Persona & Knowledge Configuration</h1>
            <p className="text-muted-foreground mt-1">
              Configure agent persona and manage knowledge snippets
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
            <Button onClick={handleSave} disabled={!selectedAgentId || updateAgent.isPending}>
              {updateAgent.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Agent List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Agent</CardTitle>
                <CardDescription>Choose an agent to configure</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {agents.map((agentItem) => (
                    <button
                      key={agentItem.id}
                      onClick={() => {
                        setSelectedAgentId(agentItem.id);
                        navigate(`/agent/${agentItem.id}/persona-knowledge`);
                      }}
                      className={`
                        w-full text-left px-4 py-3 border-l-4 transition-colors
                        ${
                          selectedAgentId === agentItem.id
                            ? "border-primary bg-primary/5 text-foreground font-medium"
                            : "border-transparent hover:bg-surface text-muted-foreground"
                        }
                      `}
                    >
                      <div className="font-medium">{agentItem.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {agentItem.status === "published" ? "Published" : "Draft"}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className={showPreview ? "lg:col-span-2" : "lg:col-span-3"}>
            {isLoadingAgent ? (
              <Card>
                <CardContent className="p-12">
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </CardContent>
              </Card>
            ) : !agent ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Please select an agent to configure</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "persona" | "knowledge")}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="persona">Persona Configuration</TabsTrigger>
                      <TabsTrigger value="knowledge">Knowledge Management</TabsTrigger>
                    </TabsList>

                    <TabsContent value="persona" className="space-y-6">
                      {localPersona && (
                        <PersonaSettings
                          persona={localPersona}
                          onChange={handlePersonaChange}
                        />
                      )}
                    </TabsContent>

                    <TabsContent value="knowledge" className="space-y-6">
                      <KnowledgeSnippetManager agentId={agent.id} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Section */}
          {showPreview && agent && localPersona && (
            <div className="lg:col-span-1">
              <PreviewPanel
                schema={agent.schema}
                persona={localPersona}
                visuals={agent.visuals}
              />
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
