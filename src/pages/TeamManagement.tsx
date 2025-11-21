import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  Shield,
  User,
  Edit,
  CreditCard,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useSubscription,
  useUpdateSeats,
  useAuditLogs,
} from "@/hooks/useSettings";
import { formatDistanceToNow, format } from "date-fns";

// Form schemas
const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const updateSeatsSchema = z.object({
  seatCount: z.number().min(1, "At least 1 seat is required").int("Must be a whole number"),
});

type InviteTeamMemberFormData = z.infer<typeof inviteTeamMemberSchema>;
type UpdateSeatsFormData = z.infer<typeof updateSeatsSchema>;

export default function TeamManagement() {
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: auditLogs, isLoading: auditLogsLoading } = useAuditLogs({ limit: 50 });

  const inviteTeamMember = useInviteTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const removeTeamMember = useRemoveTeamMember();
  const updateSeats = useUpdateSeats();

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [seatsDialogOpen, setSeatsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Forms
  const inviteForm = useForm<InviteTeamMemberFormData>({
    resolver: zodResolver(inviteTeamMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const seatsForm = useForm<UpdateSeatsFormData>({
    resolver: zodResolver(updateSeatsSchema),
    defaultValues: {
      seatCount: (subscription?.usage_metadata as any)?.seat_count || 1,
    },
  });

  // Update seats form when subscription loads
  useEffect(() => {
    if (subscription) {
      const currentSeats = (subscription.usage_metadata as any)?.seat_count || 1;
      seatsForm.reset({ seatCount: currentSeats });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscription]);

  const handleInviteSubmit = (data: InviteTeamMemberFormData) => {
    inviteTeamMember.mutate(data, {
      onSuccess: () => {
        inviteForm.reset();
        setInviteDialogOpen(false);
      },
    });
  };

  const handleRemoveMember = () => {
    if (selectedMember) {
      removeTeamMember.mutate(selectedMember, {
        onSuccess: () => {
          setRemoveMemberDialogOpen(false);
          setSelectedMember(null);
        },
      });
    }
  };

  const handleUpdateSeats = (data: UpdateSeatsFormData) => {
    updateSeats.mutate(data.seatCount, {
      onSuccess: () => {
        setSeatsDialogOpen(false);
      },
    });
  };

  const handleRoleChange = (memberId: string, newRole: "admin" | "member" | "viewer") => {
    updateTeamMember.mutate({
      memberId,
      updates: { role: newRole },
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "member":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "accepted":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      team_member_invited: "Team Member Invited",
      team_member_role_changed: "Role Changed",
      team_member_removed: "Team Member Removed",
      team_member_accepted: "Invitation Accepted",
      team_member_declined: "Invitation Declined",
      seat_added: "Seat Added",
      seat_removed: "Seat Removed",
      subscription_changed: "Subscription Changed",
      billing_updated: "Billing Updated",
      permission_changed: "Permission Changed",
      settings_updated: "Settings Updated",
    };
    return labels[actionType] || actionType;
  };

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const currentSeatCount = (subscription?.usage_metadata as any)?.seat_count || 1;
  const activeMembers = teamMembers?.filter((m) => m.invite_status === "accepted").length || 0;
  const pendingInvites = teamMembers?.filter((m) => m.invite_status === "pending").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-h2">Team Management</h1>
          <p className="text-muted mt-1">Manage team members, roles, and billing seats</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeMembers}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInvites}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting acceptance</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Seats Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeMembers} / {currentSeatCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Seat utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing & Seats
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage team members and their roles</CardDescription>
                  </div>
                  <Button onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {teamLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !teamMembers || teamMembers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted mb-4">No team members yet</p>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Invite Your First Member
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Invited</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member) => (
                          <TableRow key={member.id} className="hover:bg-surface/50 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium">{member.email}</p>
                                  {member.user_id && (
                                    <p className="text-xs text-muted-foreground">Active user</p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {member.invite_status === "pending" ? (
                                <Select
                                  value={member.role}
                                  onValueChange={(value: "admin" | "member" | "viewer") =>
                                    handleRoleChange(member.id, value)
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="viewer">Viewer</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Badge variant={getRoleBadgeVariant(member.role) as any}>
                                  {member.role}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{getStatusBadge(member.invite_status)}</TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(member.invited_at), { addSuffix: true })}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {member.invite_status === "accepted" && (
                                  <Select
                                    value={member.role}
                                    onValueChange={(value: "admin" | "member" | "viewer") =>
                                      handleRoleChange(member.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="admin">Admin</SelectItem>
                                      <SelectItem value="member">Member</SelectItem>
                                      <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                  </Select>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedMember(member.id);
                                    setRemoveMemberDialogOpen(true);
                                  }}
                                  className="text-danger hover:text-danger hover:bg-danger/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing & Seats Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seat Management</CardTitle>
                <CardDescription>Manage the number of seats in your subscription</CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 border border-border rounded-lg bg-surface/50">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Current Seats</p>
                        <p className="text-3xl font-bold">{currentSeatCount}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {activeMembers} active members using seats
                        </p>
                      </div>
                      <Button onClick={() => setSeatsDialogOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Update Seats
                      </Button>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-muted mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium mb-1">Seat Information</p>
                          <p className="text-sm text-muted-foreground">
                            Each active team member uses one seat. Pending invitations don't count
                            toward your seat limit until they're accepted. You can add or remove seats
                            at any time, and billing will be adjusted accordingly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>Track all changes to team members, roles, and billing</CardDescription>
              </CardHeader>
              <CardContent>
                {auditLogsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !auditLogs || auditLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted">No audit logs yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditLogs.map((log) => {
                      const isExpanded = expandedLogs.has(log.id);
                      return (
                        <div
                          key={log.id}
                          className="border border-border rounded-lg p-4 hover:bg-surface/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">{getActionTypeLabel(log.action_type)}</p>
                                <Badge variant="outline" className="text-xs">
                                  {log.entity_type}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(log.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </p>
                              {isExpanded && (
                                <div className="mt-3 space-y-2 pt-3 border-t border-border">
                                  {log.old_value && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Previous Value:
                                      </p>
                                      <pre className="text-xs bg-surface p-2 rounded border border-border overflow-x-auto">
                                        {JSON.stringify(log.old_value, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {log.new_value && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1">
                                        New Value:
                                      </p>
                                      <pre className="text-xs bg-surface p-2 rounded border border-border overflow-x-auto">
                                        {JSON.stringify(log.new_value, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  {Object.keys(log.metadata || {}).length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Metadata:
                                      </p>
                                      <pre className="text-xs bg-surface p-2 rounded border border-border overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleLogExpansion(log.id)}
                              className="ml-4"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Team Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to add a new team member</DialogDescription>
          </DialogHeader>
          <form onSubmit={inviteForm.handleSubmit(handleInviteSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                {...inviteForm.register("email")}
              />
              {inviteForm.formState.errors.email && (
                <p className="text-xs text-danger">{inviteForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={inviteForm.watch("role")}
                onValueChange={(value) => inviteForm.setValue("role", value as "admin" | "member" | "viewer")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-xs text-muted-foreground">Full access to all features</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="member">
                    <div>
                      <p className="font-medium">Member</p>
                      <p className="text-xs text-muted-foreground">Can create and edit agents</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div>
                      <p className="font-medium">Viewer</p>
                      <p className="text-xs text-muted-foreground">Read-only access</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteTeamMember.isPending}>
                {inviteTeamMember.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Remove Team Member Dialog */}
      <AlertDialog open={removeMemberDialogOpen} onOpenChange={setRemoveMemberDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this team member? This action cannot be undone and will
              free up a seat in your subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-danger hover:bg-danger/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Update Seats Dialog */}
      <Dialog open={seatsDialogOpen} onOpenChange={setSeatsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Seat Count</DialogTitle>
            <DialogDescription>
              Adjust the number of seats in your subscription. Billing will be updated accordingly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={seatsForm.handleSubmit(handleUpdateSeats)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="seat-count">Number of Seats</Label>
              <Input
                id="seat-count"
                type="number"
                min="1"
                {...seatsForm.register("seatCount", { valueAsNumber: true })}
              />
              {seatsForm.formState.errors.seatCount && (
                <p className="text-xs text-danger">
                  {seatsForm.formState.errors.seatCount.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                You currently have {activeMembers} active members. Make sure you have enough seats
                for all team members.
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSeatsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateSeats.isPending}>
                {updateSeats.isPending ? "Updating..." : "Update Seats"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
