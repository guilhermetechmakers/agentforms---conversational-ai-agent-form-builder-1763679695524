import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useCreatePaymentMethod } from "@/hooks/useBilling";
import { toast } from "sonner";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

const billingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

type BillingFormData = z.infer<typeof billingFormSchema>;

interface AddPaymentMethodModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

function PaymentMethodForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const createPaymentMethod = useCreatePaymentMethod();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
  });

  const onSubmit = async (data: BillingFormData) => {
    if (!stripe || !elements) {
      toast.error("Stripe is not loaded");
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method in Stripe
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: data.name,
          email: data.email,
          address: {
            line1: data.address,
            city: data.city,
            state: data.state,
            postal_code: data.zip,
            country: data.country,
          },
        },
      });

      if (pmError || !paymentMethod) {
        throw new Error(pmError?.message || "Failed to create payment method");
      }

      // Get customer ID from payment method or create customer
      // Note: In a real implementation, you'd get the customer ID from your subscription or create one
      const customerId = paymentMethod.customer || "";

      // Save payment method to database
      await createPaymentMethod.mutateAsync({
        stripe_payment_method_id: paymentMethod.id,
        stripe_customer_id: customerId,
        card_type: paymentMethod.card?.brand || null,
        card_last_four: paymentMethod.card?.last4 || "",
        card_brand: paymentMethod.card?.brand || null,
        expiry_month: paymentMethod.card?.exp_month || null,
        expiry_year: paymentMethod.card?.exp_year || null,
        billing_name: data.name,
        billing_email: data.email,
        billing_address: {
          line1: data.address,
          city: data.city,
          state: data.state,
          postal_code: data.zip,
          country: data.country,
        },
        is_default: false, // Will be set if this is the first payment method
      });

      toast.success("Payment method added successfully");
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add payment method");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="John Doe"
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="123 Main St"
              className={errors.address ? "border-destructive" : ""}
            />
            {errors.address && (
              <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="New York"
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && (
              <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              {...register("state")}
              placeholder="NY"
              className={errors.state ? "border-destructive" : ""}
            />
            {errors.state && (
              <p className="text-sm text-destructive mt-1">{errors.state.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              {...register("zip")}
              placeholder="10001"
              className={errors.zip ? "border-destructive" : ""}
            />
            {errors.zip && (
              <p className="text-sm text-destructive mt-1">{errors.zip.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register("country")}
              placeholder="United States"
              className={errors.country ? "border-destructive" : ""}
            />
            {errors.country && (
              <p className="text-sm text-destructive mt-1">{errors.country.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Card Information</Label>
        <div className="border border-input rounded-lg p-4 bg-card">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#0F172A",
                  "::placeholder": {
                    color: "#94A3B8",
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        <Button type="submit" disabled={isProcessing || !stripe}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            "Add Payment Method"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddPaymentMethodModal({
  open,
  onOpenChange,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const stripeOptions = {
    mode: "setup" as const,
    currency: "usd" as const,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new credit or debit card to your account
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise} options={stripeOptions}>
          <PaymentMethodForm onSuccess={handleSuccess} onCancel={() => onOpenChange(false)} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
