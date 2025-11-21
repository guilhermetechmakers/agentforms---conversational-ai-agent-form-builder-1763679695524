import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { useInvoice } from "@/hooks/useBilling";
import type { InvoiceRow } from "@/types/database/invoice";

interface InvoiceViewerProps {
  invoiceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceViewer({ invoiceId, open, onOpenChange }: InvoiceViewerProps) {
  const { data: invoice, isLoading } = useInvoice(invoiceId || "");

  if (!invoiceId) {
    return null;
  }

  const getStatusBadge = (status: InvoiceRow["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-success text-success-foreground">Paid</Badge>
        );
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      case "sent":
        return <Badge variant="outline">Sent</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "void":
        return <Badge variant="outline">Void</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            View and download your invoice
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : invoice ? (
          <div className="space-y-6 mt-4">
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-semibold">Invoice #{invoice.invoice_number}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(invoice.invoice_date), "MMMM dd, yyyy")}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(invoice.status)}
                {invoice.stripe_invoice_pdf_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open(invoice.stripe_invoice_pdf_url!, "_blank")}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                )}
              </div>
            </div>

            {/* Billing Information */}
            {(invoice.billing_name || invoice.billing_email) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Bill To</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {invoice.billing_name && <p>{invoice.billing_name}</p>}
                    {invoice.billing_email && <p>{invoice.billing_email}</p>}
                    {invoice.billing_address && (
                      <div className="mt-2">
                        {invoice.billing_address.line1 && (
                          <p>{invoice.billing_address.line1}</p>
                        )}
                        {invoice.billing_address.city && invoice.billing_address.state && (
                          <p>
                            {invoice.billing_address.city}, {invoice.billing_address.state}{" "}
                            {invoice.billing_address.postal_code}
                          </p>
                        )}
                        {invoice.billing_address.country && (
                          <p>{invoice.billing_address.country}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Invoice Details</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Invoice Date:</span>
                      <span>{format(new Date(invoice.invoice_date), "MMM dd, yyyy")}</span>
                    </div>
                    {invoice.due_date && (
                      <div className="flex justify-between">
                        <span>Due Date:</span>
                        <span>{format(new Date(invoice.due_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                    {invoice.paid_date && (
                      <div className="flex justify-between">
                        <span>Paid Date:</span>
                        <span>{format(new Date(invoice.paid_date), "MMM dd, yyyy")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Items */}
            {invoice.items && invoice.items.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3">Items</h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Description</th>
                        <th className="text-right p-3 text-sm font-semibold">Quantity</th>
                        <th className="text-right p-3 text-sm font-semibold">Unit Price</th>
                        <th className="text-right p-3 text-sm font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="border-t border-border">
                          <td className="p-3 text-sm">{item.description}</td>
                          <td className="p-3 text-sm text-right">{item.quantity}</td>
                          <td className="p-3 text-sm text-right">
                            ${item.unit_price.toFixed(2)}
                          </td>
                          <td className="p-3 text-sm text-right font-semibold">
                            ${item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Invoice Summary */}
            <div className="border-t border-border pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax:</span>
                      <span>${invoice.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total:</span>
                    <span>${invoice.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            )}

            {/* Stripe Hosted Invoice Link */}
            {invoice.stripe_invoice_hosted_url && (
              <div className="border-t border-border pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(invoice.stripe_invoice_hosted_url!, "_blank")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View on Stripe
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Invoice not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
