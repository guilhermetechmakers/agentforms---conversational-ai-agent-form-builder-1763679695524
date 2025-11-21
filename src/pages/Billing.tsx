import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import type { StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  CreditCard,
  FileText,
  Check,
  Sparkles,
  ArrowRight,
  Loader2,
  Plus,
} from "lucide-react";
import {
  usePlans,
  useTransactions,
  useInvoices,
  useValidatePromoCode,
  usePaymentMethods,
} from "@/hooks/useBilling";
import { PaymentMethodCard } from "@/components/billing/PaymentMethodCard";
import { AddPaymentMethodModal } from "@/components/billing/AddPaymentMethodModal";
import { SubscriptionManagement } from "@/components/billing/SubscriptionManagement";
import { InvoiceViewer } from "@/components/billing/InvoiceViewer";
import { cn } from "@/lib/utils";
import type { PlanRow } from "@/types/database/plan";

// Initialize Stripe (you'll need to set VITE_STRIPE_PUBLISHABLE_KEY in .env.local)
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

// Billing form schema
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

// Checkout form component (inside Stripe Elements)
function CheckoutForm({
  selectedPlan,
  billingCycle,
  promoCode: _promoCode,
  discountAmount,
  onSuccess,
  onError,
}: {
  selectedPlan: PlanRow | null;
  billingCycle: "monthly" | "yearly";
  promoCode?: string;
  discountAmount?: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BillingFormData>({
    resolver: zodResolver(billingFormSchema),
  });

  // Create payment intent when plan is selected
  useEffect(() => {
    if (selectedPlan && stripe) {
      // In a real implementation, this would call your backend API
      // For now, we'll show an error that backend is needed
      onError("Payment processing requires backend API implementation");
    }
  }, [selectedPlan, stripe, onError]);

  const onSubmit = async (_data: BillingFormData) => {
    if (!stripe || !elements || !selectedPlan) {
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // In a real implementation, you would:
      // 1. Create payment intent via backend API
      // 2. Confirm payment with Stripe
      // 3. Create transaction record
      // 4. Create invoice record
      // 5. Update subscription

      // For now, simulate success after a delay
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess();
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      onError(error instanceof Error ? error.message : "Payment failed");
    }
  };

  if (!selectedPlan) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Please select a plan to continue
      </div>
    );
  }

  const price = billingCycle === "monthly" ? selectedPlan.price_monthly : selectedPlan.price_yearly;
  const finalPrice = discountAmount ? Math.max(0, price - discountAmount) : price;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Billing Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Billing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="John Doe"
              className={errors.name ? "border-danger" : ""}
            />
            {errors.name && (
              <p className="text-sm text-danger mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className={errors.email ? "border-danger" : ""}
            />
            {errors.email && (
              <p className="text-sm text-danger mt-1">{errors.email.message}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="123 Main St"
              className={errors.address ? "border-danger" : ""}
            />
            {errors.address && (
              <p className="text-sm text-danger mt-1">{errors.address.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              {...register("city")}
              placeholder="New York"
              className={errors.city ? "border-danger" : ""}
            />
            {errors.city && (
              <p className="text-sm text-danger mt-1">{errors.city.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              {...register("state")}
              placeholder="NY"
              className={errors.state ? "border-danger" : ""}
            />
            {errors.state && (
              <p className="text-sm text-danger mt-1">{errors.state.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="zip">ZIP Code</Label>
            <Input
              id="zip"
              {...register("zip")}
              placeholder="10001"
              className={errors.zip ? "border-danger" : ""}
            />
            {errors.zip && (
              <p className="text-sm text-danger mt-1">{errors.zip.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              {...register("country")}
              placeholder="United States"
              className={errors.country ? "border-danger" : ""}
            />
            {errors.country && (
              <p className="text-sm text-danger mt-1">{errors.country.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Payment Information</h3>
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

      {/* Order Summary */}
      <div className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {selectedPlan.name} ({billingCycle})
            </span>
            <span>${price.toFixed(2)}</span>
          </div>
          {discountAmount && discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
            <span>Total</span>
            <span>${finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isProcessing || !stripe}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Complete Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}

export default function Billing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"plans" | "subscription" | "payment-methods" | "invoices">("plans");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeValidated, setPromoCodeValidated] = useState(false);
  const [discountAmount, setDiscountAmount] = useState<number | undefined>();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: plans, isLoading: plansLoading } = usePlans();
  const { data: transactions } = useTransactions({ limit: 10 });
  const { data: invoices } = useInvoices({ limit: 10 });
  const { data: paymentMethods } = usePaymentMethods();
  const validatePromoCode = useValidatePromoCode();

  const selectedPlan = plans?.find((p) => p.id === selectedPlanId) || null;

  // Validate promo code
  const handleValidatePromoCode = async () => {
    if (!promoCode.trim() || !selectedPlan) {
      return;
    }

    try {
      const result = await validatePromoCode.mutateAsync({
        code: promoCode,
        planId: selectedPlan.plan_id,
        amount: billingCycle === "monthly" ? selectedPlan.price_monthly : selectedPlan.price_yearly,
      });

      if (result.valid && result.discount_amount) {
        setPromoCodeValidated(true);
        setDiscountAmount(result.discount_amount);
        setError(null);
      } else {
        setPromoCodeValidated(false);
        setDiscountAmount(undefined);
        setError(result.error || "Invalid promo code");
      }
    } catch (err) {
      setPromoCodeValidated(false);
      setDiscountAmount(undefined);
      setError(err instanceof Error ? err.message : "Failed to validate promo code");
    }
  };

  const stripeOptions: StripeElementsOptions = {
    mode: "payment",
    amount: selectedPlan
      ? Math.round(
          (billingCycle === "monthly" ? selectedPlan.price_monthly : selectedPlan.price_yearly) *
            100
        )
      : 0,
    currency: "usd",
  };

  const handleViewInvoice = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setShowInvoiceDialog(true);
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-h1 mb-2">Billing & Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and invoices
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="mb-6 border-danger bg-danger/10">
            <XCircle className="h-4 w-4 text-danger" />
            <AlertDescription className="text-danger">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Cycle Toggle */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-4">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Monthly
                  </span>
                  <Switch
                    checked={billingCycle === "yearly"}
                    onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    Yearly
                  </span>
                  {billingCycle === "yearly" && (
                    <Badge variant="outline" className="ml-2 bg-success/10 text-success">
                      Save 20%
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Plan Cards */}
            {plansLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-4 w-full mt-4" />
                      <Skeleton className="h-4 w-full mt-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plans?.map((plan) => {
                  const price =
                    billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly;
                  const isSelected = selectedPlanId === plan.id;

                  return (
                    <Card
                      key={plan.id}
                      className={cn(
                        "cursor-pointer transition-all duration-300",
                        isSelected
                          ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                          : "hover:shadow-md hover:-translate-y-1"
                      )}
                      onClick={() => setSelectedPlanId(plan.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            {plan.is_featured && (
                              <Badge className="mt-2 bg-primary text-primary-foreground">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          {isSelected && (
                            <div className="rounded-full bg-primary p-1">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <span className="text-3xl font-bold">${price.toFixed(2)}</span>
                          <span className="text-muted-foreground">/{billingCycle === "monthly" ? "mo" : "yr"}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                        <ul className="space-y-2">
                          {(plan.features as string[]).slice(0, 5).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Promo Code */}
            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter promo code"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setPromoCodeValidated(false);
                        setDiscountAmount(undefined);
                        setError(null);
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleValidatePromoCode}
                      disabled={!promoCode.trim() || validatePromoCode.isPending}
                    >
                      {validatePromoCode.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {promoCodeValidated && discountAmount && (
                    <div className="mt-2 text-sm text-success flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Promo code applied! You'll save ${discountAmount.toFixed(2)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Checkout Form */}
            {selectedPlan && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete Your Purchase</CardTitle>
                  <CardDescription>
                    Enter your billing and payment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Elements stripe={stripePromise} options={stripeOptions}>
                    <CheckoutForm
                      selectedPlan={selectedPlan}
                      billingCycle={billingCycle}
                      promoCode={promoCodeValidated ? promoCode : undefined}
                      discountAmount={discountAmount}
                      onSuccess={() => {
                        setShowSuccessDialog(true);
                        setError(null);
                      }}
                      onError={(err) => setError(err)}
                    />
                  </Elements>
                </CardContent>
              </Card>
            )}
          </div>

            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionManagement />
          </TabsContent>

          {/* Payment Methods Tab */}
          <TabsContent value="payment-methods" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your saved payment methods
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddPaymentMethod(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((pm) => (
                      <PaymentMethodCard key={pm.id} paymentMethod={pm} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No payment methods</p>
                    <p className="text-sm mb-4">Add a payment method to get started</p>
                    <Button onClick={() => setShowAddPaymentMethod(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Invoice History
                </CardTitle>
                <CardDescription>
                  View and download your invoices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoices && invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-surface transition-colors cursor-pointer"
                        onClick={() => handleViewInvoice(invoice.id)}
                      >
                        <div>
                          <p className="text-sm font-medium">{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold">${invoice.amount.toFixed(2)}</p>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "default"
                                  : invoice.status === "overdue"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No invoices yet</p>
                    <p className="text-sm">Your invoices will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions && transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            ${transaction.final_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            transaction.status === "completed"
                              ? "default"
                              : transaction.status === "failed"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <DialogTitle className="text-center">Payment Successful!</DialogTitle>
              <DialogDescription className="text-center">
                Your subscription has been activated. You can now access all premium features.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSuccessDialog(false)}
              >
                View Invoice
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowSuccessDialog(false);
                  navigate("/dashboard");
                }}
              >
                Go to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Payment Method Modal */}
        <AddPaymentMethodModal
          open={showAddPaymentMethod}
          onOpenChange={setShowAddPaymentMethod}
          onSuccess={() => {
            // Payment method list will refresh automatically via React Query
          }}
        />

        {/* Invoice Viewer */}
        <InvoiceViewer
          invoiceId={selectedInvoiceId}
          open={showInvoiceDialog}
          onOpenChange={(open) => {
            setShowInvoiceDialog(open);
            if (!open) {
              setSelectedInvoiceId(null);
            }
          }}
        />
      </div>
    </DashboardLayout>
  );
}
