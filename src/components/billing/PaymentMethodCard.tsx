import { Trash2, Star, MoreVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import type { PaymentMethodRow } from "@/types/database/payment-method";
import { useSetDefaultPaymentMethod, useDeletePaymentMethod } from "@/hooks/useBilling";

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethodRow;
}

export function PaymentMethodCard({ paymentMethod }: PaymentMethodCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const setDefault = useSetDefaultPaymentMethod();
  const deleteMethod = useDeletePaymentMethod();

  const getCardBrandIcon = (brand?: string | null) => {
    const brandLower = brand?.toLowerCase() || paymentMethod.card_brand?.toLowerCase();
    switch (brandLower) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
      case 'american_express':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const formatExpiry = () => {
    if (paymentMethod.expiry_month && paymentMethod.expiry_year) {
      return `${String(paymentMethod.expiry_month).padStart(2, '0')}/${String(paymentMethod.expiry_year).slice(-2)}`;
    }
    return 'N/A';
  };

  const isExpired = () => {
    if (!paymentMethod.expiry_month || !paymentMethod.expiry_year) {
      return false;
    }
    const now = new Date();
    const expiry = new Date(paymentMethod.expiry_year, paymentMethod.expiry_month - 1);
    return expiry < now;
  };

  const handleSetDefault = () => {
    if (!paymentMethod.is_default) {
      setDefault.mutate(paymentMethod.id);
    }
  };

  const handleDelete = () => {
    deleteMethod.mutate(paymentMethod.id, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <>
      <Card
        className={cn(
          "transition-all duration-300",
          paymentMethod.is_default
            ? "ring-2 ring-primary shadow-lg"
            : "hover:shadow-md hover:-translate-y-1"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                  {getCardBrandIcon()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">
                    {paymentMethod.card_brand ? paymentMethod.card_brand.toUpperCase() : 'Card'} •••• {paymentMethod.card_last_four}
                  </h3>
                  {paymentMethod.is_default && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Default
                    </Badge>
                  )}
                  {isExpired() && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Expires {formatExpiry()}</p>
                  {paymentMethod.billing_name && (
                    <p>{paymentMethod.billing_name}</p>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!paymentMethod.is_default && (
                  <DropdownMenuItem onClick={handleSetDefault} disabled={setDefault.isPending}>
                    <Star className="mr-2 h-4 w-4" />
                    Set as default
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                  disabled={paymentMethod.is_default || deleteMethod.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method? This action cannot be undone.
              {paymentMethod.is_default && (
                <span className="block mt-2 text-warning">
                  This is your default payment method. You'll need to set a new default after removing this one.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMethod.isPending}
            >
              {deleteMethod.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
