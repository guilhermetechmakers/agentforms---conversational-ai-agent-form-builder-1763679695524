import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Download,
  FileJson,
  FileSpreadsheet,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useExports, useDeleteExport } from '@/hooks/useExports';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ExportHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'json' | 'csv'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportToDelete, setExportToDelete] = useState<string | null>(null);

  const filters = useMemo(() => ({
    format: formatFilter !== 'all' ? formatFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    page,
    pageSize: 20,
  }), [formatFilter, statusFilter, page]);

  const { data: exportsData, isLoading } = useExports(filters);
  const deleteExport = useDeleteExport();

  const filteredExports = useMemo(() => {
    if (!exportsData?.exports) return [];
    
    if (!searchQuery) return exportsData.exports;

    const query = searchQuery.toLowerCase();
    return exportsData.exports.filter((exp) => {
      return (
        exp.id.toLowerCase().includes(query) ||
        exp.session_ids.some((id) => id.toLowerCase().includes(query))
      );
    });
  }, [exportsData?.exports, searchQuery]);

  const stats = useMemo(() => {
    if (!exportsData?.exports) {
      return {
        total: 0,
        completed: 0,
        failed: 0,
        processing: 0,
        json: 0,
        csv: 0,
      };
    }

    return {
      total: exportsData.exports.length,
      completed: exportsData.exports.filter((e) => e.status === 'completed').length,
      failed: exportsData.exports.filter((e) => e.status === 'failed').length,
      processing: exportsData.exports.filter((e) => e.status === 'processing' || e.status === 'pending').length,
      json: exportsData.exports.filter((e) => e.format === 'json').length,
      csv: exportsData.exports.filter((e) => e.format === 'csv').length,
    };
  }, [exportsData?.exports]);

  const handleDelete = (exportId: string) => {
    setExportToDelete(exportId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!exportToDelete) return;
    
    try {
      await deleteExport.mutateAsync(exportToDelete);
      setDeleteDialogOpen(false);
      setExportToDelete(null);
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1">Export History</h1>
              <p className="text-muted-foreground mt-2">
                View and manage your session data exports.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Exports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'rgb(var(--success))' }}>
                  {stats.completed}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'rgb(var(--danger))' }}>
                  {stats.failed}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'rgb(var(--warning))' }}>
                  {stats.processing}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  JSON
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.json}</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  CSV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.csv}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Exports</CardTitle>
              <CardDescription>
                View and manage your export history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by export ID or session ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={formatFilter} onValueChange={(value) => {
                    setFormatFilter(value as 'all' | 'json' | 'csv');
                    setPage(1);
                  }}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Formats</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(value) => {
                    setStatusFilter(value as 'all' | 'pending' | 'processing' | 'completed' | 'failed');
                    setPage(1);
                  }}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Export List */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="h-16 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredExports.length === 0 ? (
                <div className="text-center py-12">
                  <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No exports found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || formatFilter !== 'all' || statusFilter !== 'all'
                      ? 'Try adjusting your search or filters.'
                      : 'No exports have been created yet. Export sessions to see them here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExports.map((exportItem) => (
                    <Card
                      key={exportItem.id}
                      className="hover:shadow-lg transition-shadow animate-fade-in-up"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {exportItem.format === 'json' ? (
                                <FileJson className="h-5 w-5 text-primary" />
                              ) : (
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {exportItem.format.toUpperCase()} Export
                                  </span>
                                  <Badge
                                    variant={
                                      exportItem.status === 'completed'
                                        ? 'default'
                                        : exportItem.status === 'failed'
                                          ? 'destructive'
                                          : exportItem.status === 'processing'
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                  >
                                    {exportItem.status === 'processing' && (
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    )}
                                    {exportItem.status === 'completed' && (
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                    )}
                                    {exportItem.status === 'failed' && (
                                      <XCircle className="h-3 w-3 mr-1" />
                                    )}
                                    {exportItem.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span>
                                    {exportItem.total_sessions} session(s)
                                  </span>
                                  {exportItem.file_size_bytes && (
                                    <span>{formatFileSize(exportItem.file_size_bytes)}</span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(exportItem.created_at), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {exportItem.error_message && (
                              <div className="mt-2 text-sm text-danger">
                                Error: {exportItem.error_message}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-muted-foreground">
                              Export ID: {exportItem.id.slice(0, 8)}...
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {exportItem.status === 'completed' && exportItem.file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(exportItem.file_url!, '_blank')}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(exportItem.id)}
                              disabled={deleteExport.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {exportsData && exportsData.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 20 + 1} to{' '}
                    {Math.min(page * 20, exportsData.total)} of {exportsData.total} exports
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {exportsData.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === exportsData.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Export</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this export record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="btn-danger"
              disabled={deleteExport.isPending}
            >
              {deleteExport.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
