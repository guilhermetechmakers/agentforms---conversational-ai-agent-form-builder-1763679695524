import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useSecurityAuditLogs,
  useExportAuditLogs,
} from "@/hooks/useSecurityPrivacy";
import { FileDown, Search, Calendar } from "lucide-react";
import { format } from "date-fns";

const ACTION_TYPES = [
  "data_encrypted",
  "data_decrypted",
  "retention_policy_created",
  "retention_policy_updated",
  "retention_policy_deleted",
  "data_deleted_by_retention",
  "access_control_created",
  "access_control_updated",
  "access_control_revoked",
  "dsr_request_submitted",
  "dsr_request_processed",
  "dsr_export_generated",
  "dsr_deletion_completed",
  "data_exported",
  "session_accessed",
  "sensitive_data_accessed",
  "encryption_key_rotated",
  "audit_log_exported",
  "compliance_report_generated",
];

const ENTITY_TYPES = [
  "retention_policy",
  "access_control",
  "dsr_request",
  "session",
  "export",
  "encryption_key",
  "audit_log",
];

export default function AuditLogsDashboard() {
  const [actionType, setActionType] = useState<string>("");
  const [entityType, setEntityType] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = {
    action_type: actionType || undefined,
    entity_type: entityType || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    limit: 100,
  };

  const { data: logs, isLoading } = useSecurityAuditLogs(filters);
  const exportLogs = useExportAuditLogs();

  const filteredLogs = logs?.filter((log) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      log.action_type.toLowerCase().includes(query) ||
      log.entity_type.toLowerCase().includes(query) ||
      log.metadata?.description?.toLowerCase().includes(query) ||
      false
    );
  });

  const handleExport = (format: "csv" | "json") => {
    exportLogs.mutate({ ...filters, format });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
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
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription className="mt-2">
                Comprehensive audit trail of security and privacy events
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("json")}
                disabled={exportLogs.isPending}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport("csv")}
                disabled={exportLogs.isPending}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All actions</SelectItem>
                {ACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger>
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All entities</SelectItem>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="Start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1"
              />
              <Input
                type="date"
                placeholder="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Logs Table */}
          {!filteredLogs || filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || actionType || entityType || startDate || endDate
                  ? "Try adjusting your filters"
                  : "Audit logs will appear here as security events occur"}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {log.action_type.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {log.entity_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.user_id ? (
                          <span className="font-mono text-xs">
                            {log.user_id.substring(0, 8)}...
                          </span>
                        ) : (
                          "System"
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-xs text-muted-foreground truncate">
                          {log.metadata?.description ||
                            JSON.stringify(log.old_value || log.new_value || {}).substring(0, 50) +
                              "..."}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {filteredLogs && filteredLogs.length > 0 && (
            <div className="text-sm text-muted-foreground text-center">
              Showing {filteredLogs.length} of {logs?.length || 0} logs
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
