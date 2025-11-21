import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useState } from "react";
import {
  CreditCard,
  Calendar,
  XCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import { useSubscription, useCancelSubscription, useReactivateSubscription } from "@/hooks/useBilling";

export function SubscriptionManagement() {
  const { data: subscription, isLoading } = useSubscription();
  const cancelSubscription = useCancelSubscription();
  const reactivateSubscription = useReactivateSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Select a plan to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.href = "/billing"}>
            View Plans
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (subscription.status) {
      case "active":
        return (
          <Badge className="bg-success text-success-foreground">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Canceled
          </Badge>
        );
      case "past_due":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Past Due
          </Badge>
        );
      case "trialing":
        return (
          <Badge className="bg-primary text-primary-foreground">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Trialing
          </Badge>
        );
      default:
        return <Badge>{subscription.status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const handleCancel = () => {
    cancelSubscription.mutate(undefined, {
      onSuccess: () => {
        setShowCancelDialog(false);
      },
    });
  };

  const handleReactivate = () => {
    reactivateSubscription.mutate(undefined, {
      onSuccess: () => {
        setShowReactivateDialog(false);
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{subscription.plan_name}</CardTitle>
              <CardDescription className="mt-1">
                {subscription.billing_cycle === "monthly" ? "Monthly" : "Yearly"} billing cycle
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Current Period</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Billing Cycle</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {subscription.billing_cycle}
                </p>
              </div>
            </div>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="rounded-lg border border-warning bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-warning mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning">Subscription Canceled</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your subscription will remain active until {formatDate(subscription.current_period_end)}.
                    After that date, you'll lose access to premium features.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-border">
            {subscription.cancel_at_period_end ? (
              <Button
                onClick={() => setShowReactivateDialog(true)}
                disabled={reactivateSubscription.isPending}
                className="flex-1"
              >
                {reactivateSubscription.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Reactivating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reactivate Subscription
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                className="flex-1"
                disabled={cancelSubscription.isPending}
              >
                {cancelSubscription.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Subscription
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => window.location.href = "/billing"}
            >
              Change Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? Your subscription will remain active until{" "}
              {formatDate(subscription.current_period_end)}, and you'll continue to have access to all premium
              features until then. After that date, you'll be moved to the free plan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={cancelSubscription.isPending}
            >
              {cancelSubscription.isPending ? "Canceling..." : "Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will be reactivated and will continue automatically. You'll be charged
              according to your billing cycle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReactivate}
              disabled={reactivateSubscription.isPending}
            >
              {reactivateSubscription.isPending ? "Reactivating..." : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
