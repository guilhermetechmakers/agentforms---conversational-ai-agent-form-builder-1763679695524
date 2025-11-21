import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useRetentionPolicies,
  useCreateRetentionPolicy,
  useUpdateRetentionPolicy,
  useDeleteRetentionPolicy,
} from "@/hooks/useSecurityPrivacy";
import { useAgents } from "@/hooks/useAgents";
import { Plus, Trash2, Edit, Calendar, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RetentionPolicyDataType } from "@/types/database/retention-policy";

const retentionPolicySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  data_type: z.enum([
    "sessions",
    "messages",
    "extracted_fields",
    "agent_data",
    "user_data",
    "audit_logs",
    "all",
  ]),
  retention_period_days: z.number().min(1, "Retention period must be at least 1 day"),
  auto_delete_enabled: z.boolean().default(true),
  notify_before_days: z.number().min(0).default(7),
  agent_id: z.string().optional().nullable(),
});

type RetentionPolicyFormData = z.infer<typeof retentionPolicySchema>;

export default function RetentionPolicies() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<string | null>(null);

  const { data: policies, isLoading } = useRetentionPolicies();
  const { data: agents } = useAgents();
  const createPolicy = useCreateRetentionPolicy();
  const updatePolicy = useUpdateRetentionPolicy();
  const deletePolicy = useDeleteRetentionPolicy();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RetentionPolicyFormData>({
    resolver: zodResolver(retentionPolicySchema),
    defaultValues: {
      auto_delete_enabled: true,
      notify_before_days: 7,
    },
  });

  const dataType = watch("data_type");

  const onSubmit = async (data: RetentionPolicyFormData) => {
    try {
      if (editingPolicy) {
        await updatePolicy.mutateAsync({
          id: editingPolicy,
          updates: data as any,
        });
      } else {
        await createPolicy.mutateAsync(data as any);
      }
      setIsDialogOpen(false);
      setEditingPolicy(null);
      reset();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (policyId: string) => {
    const policy = policies?.find((p) => p.id === policyId);
    if (policy) {
      setEditingPolicy(policyId);
      reset({
        name: policy.name,
        description: policy.description || "",
        data_type: policy.data_type,
        retention_period_days: policy.retention_period_days,
        auto_delete_enabled: policy.auto_delete_enabled,
        notify_before_days: policy.notify_before_days,
        agent_id: policy.agent_id || "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (deletingPolicy) {
      await deletePolicy.mutateAsync(deletingPolicy);
      setDeletingPolicy(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Retention Policies</CardTitle>
              <CardDescription className="mt-2">
                Configure data retention and auto-deletion policies for GDPR/CCPA compliance
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingPolicy(null);
                reset();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!policies || policies.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No retention policies</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a retention policy to automatically manage data lifecycle
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Policy
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{policy.name}</h4>
                          <Badge
                            variant={policy.status === "active" ? "default" : "secondary"}
                          >
                            {policy.status}
                          </Badge>
                        </div>
                        {policy.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {policy.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Data Type: </span>
                            <span className="font-medium">{policy.data_type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Retention: </span>
                            <span className="font-medium">{policy.retention_period_days} days</span>
                          </div>
                          {policy.auto_delete_enabled && (
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-warning" />
                              <span className="text-muted-foreground">Auto-delete enabled</span>
                            </div>
                          )}
                          {policy.next_execution_at && (
                            <div>
                              <span className="text-muted-foreground">Next execution: </span>
                              <span className="font-medium">
                                {formatDistanceToNow(new Date(policy.next_execution_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(policy.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingPolicy(policy.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPolicy ? "Edit Retention Policy" : "Create Retention Policy"}
            </DialogTitle>
            <DialogDescription>
              Configure when data should be automatically deleted
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Policy Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Session Data Retention"
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Optional description"
              />
            </div>

            <div>
              <Label htmlFor="data_type">Data Type *</Label>
              <Select
                value={dataType || ""}
                onValueChange={(value) => setValue("data_type", value as RetentionPolicyDataType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">Sessions</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="extracted_fields">Extracted Fields</SelectItem>
                  <SelectItem value="agent_data">Agent Data</SelectItem>
                  <SelectItem value="user_data">User Data</SelectItem>
                  <SelectItem value="audit_logs">Audit Logs</SelectItem>
                  <SelectItem value="all">All Data</SelectItem>
                </SelectContent>
              </Select>
              {errors.data_type && (
                <p className="text-sm text-destructive mt-1">{errors.data_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="retention_period_days">Retention Period (days) *</Label>
              <Input
                id="retention_period_days"
                type="number"
                {...register("retention_period_days", { valueAsNumber: true })}
                min={1}
                placeholder="30"
              />
              {errors.retention_period_days && (
                <p className="text-sm text-destructive mt-1">
                  {errors.retention_period_days.message}
                </p>
              )}
            </div>

            {dataType !== "all" && agents && agents.length > 0 && (
              <div>
                <Label htmlFor="agent_id">Apply to Specific Agent (Optional)</Label>
                <Select
                  value={watch("agent_id") || ""}
                  onValueChange={(value) => setValue("agent_id", value || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All agents</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label htmlFor="auto_delete_enabled" className="cursor-pointer">
                  Enable Auto-Deletion
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically delete data after retention period
                </p>
              </div>
              <Switch
                id="auto_delete_enabled"
                checked={watch("auto_delete_enabled")}
                onCheckedChange={(checked) => setValue("auto_delete_enabled", checked)}
              />
            </div>

            {watch("auto_delete_enabled") && (
              <div>
                <Label htmlFor="notify_before_days">Notify Before Deletion (days)</Label>
                <Input
                  id="notify_before_days"
                  type="number"
                  {...register("notify_before_days", { valueAsNumber: true })}
                  min={0}
                  placeholder="7"
                />
                {errors.notify_before_days && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.notify_before_days.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingPolicy(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createPolicy.isPending || updatePolicy.isPending}>
                {editingPolicy ? "Update" : "Create"} Policy
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingPolicy} onOpenChange={() => setDeletingPolicy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Retention Policy</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this retention policy? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
