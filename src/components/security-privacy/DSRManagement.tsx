import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useDSRRequests,
  useCreateDSRRequest,
} from "@/hooks/useSecurityPrivacy";
import { Plus, FileDown, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type { DSRRequestType } from "@/types/database/dsr-request";

const dsrRequestSchema = z.object({
  request_type: z.enum(["export", "deletion", "portability", "rectification"]),
  description: z.string().optional().nullable(),
  requested_data_types: z.array(z.string()).default([]),
});

type DSRRequestFormData = z.infer<typeof dsrRequestSchema>;

const DATA_TYPES = [
  "sessions",
  "messages",
  "extracted_fields",
  "agent_data",
  "user_profile",
  "audit_logs",
  "all",
];

export default function DSRManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: requests, isLoading } = useDSRRequests();
  const createRequest = useCreateDSRRequest();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<DSRRequestFormData>({
    resolver: zodResolver(dsrRequestSchema),
    defaultValues: {
      requested_data_types: [],
    },
  });

  const selectedDataTypes = watch("requested_data_types") || [];

  const toggleDataType = (dataType: string) => {
    const current = selectedDataTypes;
    if (current.includes(dataType)) {
      setValue(
        "requested_data_types",
        current.filter((t) => t !== dataType)
      );
    } else {
      setValue("requested_data_types", [...current, dataType]);
    }
  };

  const onSubmit = async (data: DSRRequestFormData) => {
    try {
      await createRequest.mutateAsync({
        ...data,
        requested_data_types: data.requested_data_types.length > 0
          ? data.requested_data_types
          : ["all"],
      } as any);
      setIsDialogOpen(false);
      reset();
    } catch (error) {
      // Error handled by hook
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-warning">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
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
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription className="mt-2">
                Exercise your privacy rights under GDPR and CCPA
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Submit Request
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No data subject requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Submit a request to export or delete your personal data
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit First Request
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold capitalize">
                            {request.request_type.replace(/_/g, " ")} Request
                          </h4>
                          {getStatusBadge(request.status)}
                        </div>
                        {request.description && (
                          <p className="text-sm text-muted-foreground mb-3">
                            {request.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Submitted: </span>
                            <span className="font-medium">
                              {format(new Date(request.submitted_at), "MMM d, yyyy")}
                            </span>
                          </div>
                          {request.due_date && (
                            <div>
                              <span className="text-muted-foreground">Due: </span>
                              <span className="font-medium">
                                {format(new Date(request.due_date), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                          {request.completed_at && (
                            <div>
                              <span className="text-muted-foreground">Completed: </span>
                              <span className="font-medium">
                                {format(new Date(request.completed_at), "MMM d, yyyy")}
                              </span>
                            </div>
                          )}
                        </div>
                        {request.requested_data_types.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {request.requested_data_types.map((type) => (
                              <Badge key={type} variant="outline" className="text-xs">
                                {type.replace(/_/g, " ")}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {request.export_file_url && request.status === "completed" && (
                          <div className="mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(request.export_file_url!, "_blank")}
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              Download Export
                            </Button>
                            {request.export_file_expires_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Expires:{" "}
                                {formatDistanceToNow(new Date(request.export_file_expires_at), {
                                  addSuffix: true,
                                })}
                              </p>
                            )}
                          </div>
                        )}
                        {request.deleted_records_count > 0 && (
                          <div className="mt-3 p-3 rounded-lg bg-muted/50">
                            <p className="text-sm">
                              <span className="font-semibold">{request.deleted_records_count}</span>{" "}
                              records deleted
                            </p>
                            {request.deleted_data_types.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {request.deleted_data_types.map((type) => (
                                  <Badge key={type} variant="secondary" className="text-xs">
                                    {type}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Data Subject Request</DialogTitle>
            <DialogDescription>
              Request access to, deletion of, or portability of your personal data
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="request_type">Request Type *</Label>
              <Select
                value={watch("request_type") || ""}
                onValueChange={(value) => setValue("request_type", value as DSRRequestType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select request type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">
                    Export Data (Right to Access - GDPR Article 15)
                  </SelectItem>
                  <SelectItem value="deletion">
                    Delete Data (Right to Erasure - GDPR Article 17)
                  </SelectItem>
                  <SelectItem value="portability">
                    Data Portability (GDPR Article 20)
                  </SelectItem>
                  <SelectItem value="rectification">
                    Rectify Data (GDPR Article 16)
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.request_type && (
                <p className="text-sm text-destructive mt-1">{errors.request_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Additional details about your request"
                rows={3}
              />
            </div>

            <div>
              <Label>Data Types to Include *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 p-4 rounded-lg border bg-muted/20">
                {DATA_TYPES.map((dataType) => (
                  <div key={dataType} className="flex items-center space-x-2">
                    <Checkbox
                      id={dataType}
                      checked={selectedDataTypes.includes(dataType)}
                      onCheckedChange={() => toggleDataType(dataType)}
                    />
                    <Label
                      htmlFor={dataType}
                      className="text-sm font-normal cursor-pointer capitalize"
                    >
                      {dataType.replace(/_/g, " ")}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDataTypes.length === 0 && (
                <p className="text-sm text-destructive mt-1">
                  Please select at least one data type
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>You'll receive an email confirmation with a verification link</li>
                <li>We'll process your request within 30 days (GDPR requirement)</li>
                <li>For export requests, you'll receive a download link</li>
                <li>For deletion requests, data will be permanently removed</li>
              </ul>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRequest.isPending || selectedDataTypes.length === 0}
              >
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
