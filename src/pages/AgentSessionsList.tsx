import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  Download,
  Trash2,
  CheckCircle2,
  FileJson,
  FileSpreadsheet,
  MessageSquare,
  BarChart3,
  Clock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SessionFilters } from '@/components/session-list/SessionFilters';
import { SessionRow } from '@/components/session-list/SessionRow';
import { SessionDetailModal } from '@/components/session-list/SessionDetailModal';
import { BulkActionDialog, type BulkActionType } from '@/components/session-list/BulkActionDialog';
import {
  useAgentSessions,
  useSessionMetrics,
  useBulkExportSessionsJSON,
  useBulkExportSessionsCSV,
  useBulkDeleteSessions,
  useBulkMarkSessionsReviewed,
} from '@/hooks/useSessions';
import { useAgent } from '@/hooks/useAgents';
import type { GetSessionsFilters } from '@/api/sessions';
import { toast } from 'sonner';

export default function AgentSessionsList() {
  const { id: agentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<GetSessionsFilters>({
    agentId,
    page: 1,
    pageSize: 20,
  });
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<BulkActionType | null>(null);

  // Fetch agent info
  const { data: agent } = useAgent(agentId || '');

  // Fetch sessions
  const {
    data: sessionsData,
    isLoading: sessionsLoading,
    error: sessionsError,
  } = useAgentSessions(filters);

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useSessionMetrics(agentId);

  // Bulk action hooks
  const bulkExportJSON = useBulkExportSessionsJSON();
  const bulkExportCSV = useBulkExportSessionsCSV();
  const bulkDelete = useBulkDeleteSessions();
  const bulkMarkReviewed = useBulkMarkSessionsReviewed();

  // Extract available tags from sessions
  const availableTags = useMemo(() => {
    if (!sessionsData?.sessions) return [];
    const tagSet = new Set<string>();
    sessionsData.sessions.forEach((session) => {
      session.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [sessionsData]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: GetSessionsFilters) => {
    setFilters({ ...newFilters, agentId, page: 1 }); // Reset to page 1 on filter change
    setSelectedSessions(new Set()); // Clear selections
  };

  // Handle session selection
  const handleSelectSession = (sessionId: string, selected: boolean) => {
    const newSelected = new Set(selectedSessions);
    if (selected) {
      newSelected.add(sessionId);
    } else {
      newSelected.delete(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked && sessionsData?.sessions) {
      setSelectedSessions(new Set(sessionsData.sessions.map((s) => s.id)));
    } else {
      setSelectedSessions(new Set());
    }
  };

  // Handle view session
  const handleViewSession = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setDetailModalOpen(true);
  };

  // Handle export single session
  const handleExportSession = async (sessionId: string) => {
    try {
      await bulkExportJSON.mutateAsync([sessionId]);
      // File download is handled by the hook
    } catch (error) {
      // Error handled by hook
    }
  };

  // Handle bulk actions
  const handleBulkAction = (action: BulkActionType) => {
    if (selectedSessions.size === 0) {
      toast.error('Please select at least one session');
      return;
    }
    setBulkActionType(action);
    setBulkActionDialogOpen(true);
  };

  const handleConfirmBulkAction = async () => {
    if (!bulkActionType || selectedSessions.size === 0) return;

    const sessionIds = Array.from(selectedSessions);

    try {
      switch (bulkActionType) {
        case 'export':
          // Show export format selection
          toast.info('Choose export format from the menu');
          setBulkActionDialogOpen(false);
          break;
        case 'delete':
          await bulkDelete.mutateAsync(sessionIds);
          setSelectedSessions(new Set());
          setBulkActionDialogOpen(false);
          break;
        case 'mark-reviewed':
          await bulkMarkReviewed.mutateAsync(sessionIds);
          setSelectedSessions(new Set());
          setBulkActionDialogOpen(false);
          break;
      }
    } catch (error) {
      // Error handled by hooks
    }
  };

  const handleBulkExportJSON = async () => {
    if (selectedSessions.size === 0) return;
    try {
      await bulkExportJSON.mutateAsync(Array.from(selectedSessions));
      setSelectedSessions(new Set());
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleBulkExportCSV = async () => {
    if (selectedSessions.size === 0) return;
    try {
      await bulkExportCSV.mutateAsync(Array.from(selectedSessions));
      setSelectedSessions(new Set());
    } catch (error) {
      // Error handled by hook
    }
  };

  // Pagination
  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    setSelectedSessions(new Set()); // Clear selections on page change
  };

  const isAllSelected =
    sessionsData?.sessions &&
    sessionsData.sessions.length > 0 &&
    sessionsData.sessions.every((s) => selectedSessions.has(s.id));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-surface"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-h2">Agent Sessions List</h1>
              {agent && (
                <p className="text-muted mt-1">
                  Sessions for <strong>{agent.name}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        {metricsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">Total Sessions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalSessions}</div>
                <p className="text-xs text-muted mt-1">All time</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">This Month</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.sessionsThisMonth}</div>
                <p className="text-xs text-muted mt-1">
                  {metrics.completionRateThisMonth}% completion
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">Completion Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageCompletionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted mt-1">Average</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.averageDuration.toFixed(1)}m</div>
                <p className="text-xs text-muted mt-1">Minutes</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Filters */}
        <SessionFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          availableTags={availableTags}
        />

        {/* Bulk Actions Toolbar */}
        {selectedSessions.size > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {selectedSessions.size} session(s) selected
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleBulkExportJSON}>
                        <FileJson className="mr-2 h-4 w-4" />
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleBulkExportCSV}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('mark-reviewed')}
                    disabled={bulkMarkReviewed.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark as Reviewed
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    disabled={bulkDelete.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        {sessionsError ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-danger mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading sessions</h3>
              <p className="text-muted text-center mb-6">
                {sessionsError instanceof Error
                  ? sessionsError.message
                  : 'Failed to load sessions. Please try again.'}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        ) : sessionsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !sessionsData || sessionsData.sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions found</h3>
              <p className="text-muted text-center mb-6">
                {Object.keys(filters).length > 3
                  ? 'No sessions match your filters. Try adjusting your search criteria.'
                  : 'This agent has no sessions yet. Share the agent link to start collecting data.'}
              </p>
              {agent && (
                <Link to={`/agent/${agent.id}/edit`}>
                  <Button variant="outline">View Agent Settings</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-2 p-2 bg-surface rounded-lg">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              <span className="text-sm text-muted">
                Select all {sessionsData.sessions.length} sessions on this page
              </span>
            </div>

            {/* Session Rows */}
            <div className="space-y-4">
              {sessionsData.sessions.map((session, index) => (
                <div
                  key={session.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SessionRow
                    session={session}
                    isSelected={selectedSessions.has(session.id)}
                    onSelect={handleSelectSession}
                    onView={handleViewSession}
                    onExport={handleExportSession}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {sessionsData.totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted">
                  Showing {(filters.page! - 1) * (filters.pageSize || 20) + 1} to{' '}
                  {Math.min(filters.page! * (filters.pageSize || 20), sessionsData.total)} of{' '}
                  {sessionsData.total} sessions
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-muted">
                    Page {filters.page} of {sessionsData.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === sessionsData.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        sessionId={selectedSessionId}
      />

      {/* Bulk Action Dialog */}
      {bulkActionType && (
        <BulkActionDialog
          open={bulkActionDialogOpen}
          onOpenChange={setBulkActionDialogOpen}
          action={bulkActionType}
          sessionCount={selectedSessions.size}
          onConfirm={handleConfirmBulkAction}
          isProcessing={
            bulkDelete.isPending ||
            bulkMarkReviewed.isPending ||
            bulkExportJSON.isPending ||
            bulkExportCSV.isPending
          }
        />
      )}
    </DashboardLayout>
  );
}
