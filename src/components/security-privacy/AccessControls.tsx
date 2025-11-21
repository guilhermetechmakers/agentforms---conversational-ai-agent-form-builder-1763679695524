import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useAccessControls,
  useCreateAccessControl,
  useUpdateAccessControl,
  useDeleteAccessControl,
} from "@/hooks/useSecurityPrivacy";
import { Plus, Trash2, Edit, Shield, Clock } from "lucide-react";
import { format } from "date-fns";
import type {
  AccessControlResourceType,
  AccessControlPermissionLevel,
  AccessControlScopeType,
} from "@/types/database/access-control";

const accessControlSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  resource_type: z.enum([
    "session",
    "agent",
    "export",
    "webhook",
    "settings",
    "billing",
    "team",
    "all",
  ]),
  resource_id: z.string().optional().nullable(),
  permission_level: z.enum(["read", "write", "delete", "admin", "none"]),
  scope_type: z.enum(["user", "role", "team"]),
  scope_id: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
});

type AccessControlFormData = z.infer<typeof accessControlSchema>;

export default function AccessControls() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingControl, setEditingControl] = useState<string | null>(null);
  const [deletingControl, setDeletingControl] = useState<string | null>(null);

  const { data: controls, isLoading } = useAccessControls();
  const createControl = useCreateAccessControl();
  const updateControl = useUpdateAccessControl();
  const deleteControl = useDeleteAccessControl();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AccessControlFormData>({
    resolver: zodResolver(accessControlSchema),
    defaultValues: {
      permission_level: "read",
      scope_type: "user",
    },
  });

  const onSubmit = async (data: AccessControlFormData) => {
    try {
      if (editingControl) {
        await updateControl.mutateAsync({
          id: editingControl,
          updates: data as any,
        });
      } else {
        await createControl.mutateAsync(data as any);
      }
      setIsDialogOpen(false);
      setEditingControl(null);
      reset();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleEdit = (controlId: string) => {
    const control = controls?.find((c) => c.id === controlId);
    if (control) {
      setEditingControl(controlId);
      reset({
        name: control.name,
        description: control.description || "",
        resource_type: control.resource_type,
        resource_id: control.resource_id || "",
        permission_level: control.permission_level,
        scope_type: control.scope_type,
        scope_id: control.scope_id || "",
        expires_at: control.expires_at
          ? format(new Date(control.expires_at), "yyyy-MM-dd")
          : "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async () => {
    if (deletingControl) {
      await deleteControl.mutateAsync(deletingControl);
      setDeletingControl(null);
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
              <CardTitle>Access Controls</CardTitle>
              <CardDescription className="mt-2">
                Manage permissions for sessions, data exports, and sensitive operations
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setEditingControl(null);
                reset();
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Control
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!controls || controls.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No access controls</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create access controls to manage permissions on resources
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Control
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {controls.map((control) => (
                <Card key={control.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{control.name}</h4>
                          <Badge
                            variant={
                              control.status === "active"
                                ? "default"
                                : control.status === "expired"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {control.status}
                          </Badge>
                          <Badge variant="outline">{control.permission_level}</Badge>
                        </div>
                        {control.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {control.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Resource: </span>
                            <span className="font-medium">{control.resource_type}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Scope: </span>
                            <span className="font-medium">{control.scope_type}</span>
                          </div>
                          {control.expires_at && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">Expires: </span>
                              <span className="font-medium">
                                {format(new Date(control.expires_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(control.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingControl(control.id)}
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
              {editingControl ? "Edit Access Control" : "Create Access Control"}
            </DialogTitle>
            <DialogDescription>
              Configure permissions for resources and operations
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Control Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., Session Read Access"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resource_type">Resource Type *</Label>
                <Select
                  value={watch("resource_type") || ""}
                  onValueChange={(value) =>
                    setValue("resource_type", value as AccessControlResourceType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="session">Session</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="settings">Settings</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
                {errors.resource_type && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.resource_type.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="permission_level">Permission Level *</Label>
                <Select
                  value={watch("permission_level") || ""}
                  onValueChange={(value) =>
                    setValue("permission_level", value as AccessControlPermissionLevel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="write">Write</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
                {errors.permission_level && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.permission_level.message}
                  </p>
                )}
              </div>
            </div>

            {watch("resource_type") !== "all" && (
              <div>
                <Label htmlFor="resource_id">Resource ID (Optional)</Label>
                <Input
                  id="resource_id"
                  {...register("resource_id")}
                  placeholder="Specific resource UUID"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scope_type">Scope Type *</Label>
                <Select
                  value={watch("scope_type") || ""}
                  onValueChange={(value) =>
                    setValue("scope_type", value as AccessControlScopeType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
                {errors.scope_type && (
                  <p className="text-sm text-destructive mt-1">{errors.scope_type.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="scope_id">Scope ID (Optional)</Label>
                <Input
                  id="scope_id"
                  {...register("scope_id")}
                  placeholder="User/role/team UUID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expires_at">Expiration Date (Optional)</Label>
              <Input
                id="expires_at"
                type="date"
                {...register("expires_at")}
                value={watch("expires_at") || ""}
                onChange={(e) => setValue("expires_at", e.target.value || null)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingControl(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createControl.isPending || updateControl.isPending}>
                {editingControl ? "Update" : "Create"} Control
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingControl} onOpenChange={() => setDeletingControl(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Access Control</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this access control? This action cannot be undone.
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
