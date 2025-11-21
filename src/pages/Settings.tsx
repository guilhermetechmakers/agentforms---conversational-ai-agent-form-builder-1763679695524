import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  User,
  Users,
  CreditCard,
  Shield,
  Bell,
  Mail,
  Plus,
  Trash2,
  Key,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  useProfile,
  useUpdateProfile,
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useSubscription,
  useSecuritySettings,
  useUpdateSecuritySettings,
  useChangePassword,
  useNotificationPreferences,
  useUpdateNotificationPreference,
} from "@/hooks/useSettings";
import { useUser } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

// Form schemas
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional().nullable(),
});

const inviteTeamMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member", "viewer"]),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password confirmation is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type InviteTeamMemberFormData = z.infer<typeof inviteTeamMemberSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function Settings() {
  const { data: user } = useUser();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: teamMembers, isLoading: teamLoading } = useTeamMembers();
  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: securitySettings, isLoading: securityLoading } = useSecuritySettings();
  const { data: notificationPreferences, isLoading: notificationsLoading } = useNotificationPreferences();

  const updateProfile = useUpdateProfile();
  const inviteTeamMember = useInviteTeamMember();
  const updateTeamMember = useUpdateTeamMember();
  const removeTeamMember = useRemoveTeamMember();
  const updateSecuritySettings = useUpdateSecuritySettings();
  const changePassword = useChangePassword();
  const updateNotificationPreference = useUpdateNotificationPreference();

  // Dialog states
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [removeMemberDialogOpen, setRemoveMemberDialogOpen] = useState(false);
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || "",
      company: profile?.company || null,
    },
  });

  // Invite team member form
  const inviteForm = useForm<InviteTeamMemberFormData>({
    resolver: zodResolver(inviteTeamMemberSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  // Change password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  // Update profile form when profile data loads
  useEffect(() => {
    if (profile) {
      const profileData = profile as { name?: string; company?: string | null };
      if (!profileForm.formState.isDirty) {
        profileForm.reset({
          name: profileData?.name || "",
          company: profileData?.company || null,
        });
      }
    }
  }, [profile, profileForm]);

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

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

  const handleChangePassword = (data: ChangePasswordFormData) => {
    changePassword.mutate(data.newPassword, {
      onSuccess: () => {
        passwordForm.reset();
        setChangePasswordDialogOpen(false);
      },
    });
  };

  const handleToggle2FA = (enabled: boolean) => {
    updateSecuritySettings.mutate({ two_factor_enabled: enabled });
  };

  const handleToggleSSO = (enabled: boolean) => {
    updateSecuritySettings.mutate({ sso_enabled: enabled });
  };

  const handleNotificationToggle = (alertType: string, field: 'enabled' | 'email_enabled' | 'in_app_enabled', value: boolean) => {
    updateNotificationPreference.mutate({
      alertType: alertType as any,
      updates: { [field]: value },
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
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case "accepted":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Active</Badge>;
      case "declined":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" />Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const notificationTypes = [
    { type: "session_completed", label: "Session Completed", description: "When a session is successfully completed" },
    { type: "session_failed", label: "Session Failed", description: "When a session fails or errors occur" },
    { type: "webhook_failed", label: "Webhook Failed", description: "When a webhook delivery fails" },
    { type: "agent_published", label: "Agent Published", description: "When an agent is published" },
    { type: "team_invite", label: "Team Invite", description: "When you receive a team invitation" },
    { type: "billing_update", label: "Billing Update", description: "When billing or subscription changes" },
    { type: "security_alert", label: "Security Alert", description: "Important security-related notifications" },
    { type: "weekly_summary", label: "Weekly Summary", description: "Weekly activity summary" },
    { type: "monthly_report", label: "Monthly Report", description: "Monthly usage and analytics report" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-h2">Settings</h1>
          <p className="text-muted mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="h-11 w-full" />
                    <Skeleton className="h-11 w-full" />
                  </div>
                ) : (
                  <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-surface"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to update it.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        {...profileForm.register("name")}
                        placeholder="Your full name"
                      />
                      {profileForm.formState.errors.name && (
                        <p className="text-xs text-danger">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        {...profileForm.register("company")}
                        placeholder="Your company name (optional)"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!profileForm.formState.isDirty || updateProfile.isPending}
                      >
                        {updateProfile.isPending ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage team members and their roles
                    </CardDescription>
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
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted mb-4">No team members yet</p>
                    <Button onClick={() => setInviteDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Invite Your First Member
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{member.email}</p>
                              <p className="text-sm text-muted-foreground">
                                {member.invite_status === "pending"
                                  ? "Invitation pending"
                                  : member.user_id
                                  ? "Active member"
                                  : "Not yet accepted"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(member.invite_status)}
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                          {member.invite_status === "pending" && (
                            <Select
                              value={member.role}
                              onValueChange={(value: "admin" | "member" | "viewer") => {
                                updateTeamMember.mutate({
                                  memberId: member.id,
                                  updates: { role: value },
                                });
                              }}
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
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : subscription ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <p className="font-semibold">{subscription.plan_name} Plan</p>
                        <p className="text-sm text-muted-foreground">
                          {subscription.billing_cycle === "monthly" ? "Monthly" : "Yearly"} billing
                        </p>
                      </div>
                      <Badge variant={subscription.status === "active" ? "default" : "outline"}>
                        {subscription.status}
                      </Badge>
                    </div>

                    {subscription.current_period_end && (
                      <div className="p-4 border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Current Period Ends</p>
                        <p className="font-semibold">
                          {new Date(subscription.current_period_end).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => window.location.href = "/billing"}>
                        Change Plan
                      </Button>
                      {subscription.status === "active" && (
                        <Button variant="outline" onClick={() => {
                          // Handle cancel subscription
                          updateSecuritySettings.mutate({
                            // This would typically call a cancel subscription API
                          });
                        }}>
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted mb-4">No subscription found</p>
                    <Button onClick={() => window.location.href = "/billing"}>
                      View Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {securityLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : securitySettings ? (
                  <>
                    {/* Password Change */}
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Key className="h-4 w-4 text-muted" />
                          <p className="font-semibold">Password</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {securitySettings.last_password_change_at
                            ? `Last changed ${formatDistanceToNow(new Date(securitySettings.last_password_change_at), { addSuffix: true })}`
                            : "Set a strong password to secure your account"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setChangePasswordDialogOpen(true)}
                      >
                        Change Password
                      </Button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Shield className="h-4 w-4 text-muted" />
                          <p className="font-semibold">Two-Factor Authentication</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.two_factor_enabled}
                        onCheckedChange={handleToggle2FA}
                        disabled={updateSecuritySettings.isPending}
                      />
                    </div>

                    {/* Single Sign-On */}
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Lock className="h-4 w-4 text-muted" />
                          <p className="font-semibold">Single Sign-On (SSO)</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enable SSO for enterprise authentication
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.sso_enabled}
                        onCheckedChange={handleToggleSSO}
                        disabled={updateSecuritySettings.isPending}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted mx-auto mb-4" />
                    <p className="text-muted">Loading security settings...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notificationsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notificationTypes.map((notifType) => {
                      const preference = notificationPreferences?.find(
                        (p) => p.alert_type === notifType.type
                      ) || {
                        enabled: true,
                        email_enabled: true,
                        in_app_enabled: true,
                      };

                      return (
                        <div
                          key={notifType.type}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-surface transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{notifType.label}</p>
                            <p className="text-sm text-muted-foreground">{notifType.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={preference.enabled}
                                  onCheckedChange={(checked) =>
                                    handleNotificationToggle(notifType.type, "enabled", checked)
                                  }
                                />
                                <Label className="text-xs">Enabled</Label>
                              </div>
                              {preference.enabled && (
                                <>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={preference.email_enabled}
                                      onCheckedChange={(checked) =>
                                        handleNotificationToggle(notifType.type, "email_enabled", checked)
                                      }
                                      disabled={!preference.enabled}
                                    />
                                    <Label className="text-xs flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      Email
                                    </Label>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={preference.in_app_enabled}
                                      onCheckedChange={(checked) =>
                                        handleNotificationToggle(notifType.type, "in_app_enabled", checked)
                                      }
                                      disabled={!preference.enabled}
                                    />
                                    <Label className="text-xs">In-App</Label>
                                  </div>
                                </>
                              )}
                            </div>
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
            <DialogDescription>
              Send an invitation to add a new team member
            </DialogDescription>
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
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                  <SelectItem value="member">Member - Can create and edit</SelectItem>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
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
              Are you sure you want to remove this team member? This action cannot be undone.
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

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                {...passwordForm.register("currentPassword")}
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-danger">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                {...passwordForm.register("newPassword")}
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-danger">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                {...passwordForm.register("confirmPassword")}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-danger">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setChangePasswordDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={changePassword.isPending}>
                {changePassword.isPending ? "Changing..." : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
