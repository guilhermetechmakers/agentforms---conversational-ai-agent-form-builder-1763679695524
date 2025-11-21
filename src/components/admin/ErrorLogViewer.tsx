import { useState } from 'react';
import { useErrorLogs } from '@/hooks/useErrors';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertCircle,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Globe,
  Code,
} from 'lucide-react';
import { format } from 'date-fns';
import type { ErrorLog } from '@/types/database/error-log';

export function ErrorLogViewer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [errorTypeFilter, setErrorTypeFilter] = useState<string>('all');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [limit, setLimit] = useState(50);

  const { data: errorLogs, isLoading } = useErrorLogs(limit);

  // Filter error logs
  const filteredLogs = errorLogs?.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.error_message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.url_attempted.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = errorTypeFilter === 'all' || log.error_type === errorTypeFilter;

    return matchesSearch && matchesType;
  }) || [];

  const errorTypeCounts = errorLogs?.reduce(
    (acc, log) => {
      acc[log.error_type] = (acc[log.error_type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) || {};

  const getErrorTypeBadgeVariant = (type: string) => {
    switch (type) {
      case '404':
        return 'secondary';
      case '500':
        return 'destructive';
      case '400':
        return 'default';
      case '403':
        return 'default';
      case 'network':
        return 'secondary';
      case 'validation':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Logs
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                View and monitor application errors
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search errors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="404">404 Not Found</SelectItem>
                <SelectItem value="500">500 Server Error</SelectItem>
                <SelectItem value="400">400 Bad Request</SelectItem>
                <SelectItem value="403">403 Forbidden</SelectItem>
                <SelectItem value="network">Network Error</SelectItem>
                <SelectItem value="validation">Validation Error</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Type Summary */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(errorTypeCounts).map(([type, count]) => (
              <Badge
                key={type}
                variant={getErrorTypeBadgeVariant(type)}
                className="cursor-pointer"
                onClick={() => setErrorTypeFilter(type)}
              >
                {type}: {count}
              </Badge>
            ))}
          </div>

          {/* Error Logs Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">Loading error logs...</div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No error logs found</p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-surface">
                      <TableCell>
                        <Badge variant={getErrorTypeBadgeVariant(log.error_type)}>
                          {log.error_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={log.error_message || 'No message'}>
                          {log.error_message || 'No error message'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm text-muted-foreground" title={log.url_attempted}>
                          {log.url_attempted}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.status_code ? (
                          <Badge variant="outline">{log.status_code}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedError(log)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Load More */}
          {filteredLogs.length >= limit && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setLimit(limit + 50)}
              >
                Load More
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Detail Dialog */}
      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-danger" />
              Error Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about this error
            </DialogDescription>
          </DialogHeader>
          {selectedError && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Error Type</p>
                    <Badge variant={getErrorTypeBadgeVariant(selectedError.error_type)}>
                      {selectedError.error_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Status Code</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedError.status_code || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">HTTP Method</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedError.http_method || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedError.created_at), 'PPpp')}
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                <div>
                  <p className="text-sm font-medium mb-2">Error Message</p>
                  <div className="rounded-lg bg-surface border border-border p-3">
                    <p className="text-sm">{selectedError.error_message || 'No error message'}</p>
                  </div>
                </div>

                {/* URL */}
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    URL Attempted
                  </p>
                  <div className="rounded-lg bg-surface border border-border p-3">
                    <p className="text-sm break-all">{selectedError.url_attempted}</p>
                  </div>
                </div>

                {/* User Info */}
                {selectedError.user_id && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User ID
                    </p>
                    <div className="rounded-lg bg-surface border border-border p-3">
                      <p className="text-sm font-mono">{selectedError.user_id}</p>
                    </div>
                  </div>
                )}

                {/* Stack Trace */}
                {selectedError.stack_trace && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Stack Trace
                    </p>
                    <ScrollArea className="h-64 rounded-lg bg-surface border border-border p-3">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {selectedError.stack_trace}
                      </pre>
                    </ScrollArea>
                  </div>
                )}

                {/* User Agent */}
                {selectedError.user_agent && (
                  <div>
                    <p className="text-sm font-medium mb-2">User Agent</p>
                    <div className="rounded-lg bg-surface border border-border p-3">
                      <p className="text-xs break-all">{selectedError.user_agent}</p>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {selectedError.additional_info &&
                  Object.keys(selectedError.additional_info).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Additional Information</p>
                      <div className="rounded-lg bg-surface border border-border p-3">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {JSON.stringify(selectedError.additional_info, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
