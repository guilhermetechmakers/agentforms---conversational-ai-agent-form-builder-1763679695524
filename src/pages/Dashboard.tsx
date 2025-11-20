import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  ExternalLink,
  BarChart3,
  Copy,
  Trash2,
  MessageSquare,
  Calendar,
  Users,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteAgentDialog } from "@/components/dashboard/DeleteAgentDialog";
import { ViewAgentLinkDialog } from "@/components/dashboard/ViewAgentLinkDialog";
import { FilterSidebar } from "@/components/dashboard/FilterSidebar";
import { useAgents, useAgentUsageStats, useDuplicateAgent } from "@/hooks/useAgents";
import { formatDistanceToNow } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AgentRow } from "@/types/database/agent";

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<{
    status?: "draft" | "published" | "archived";
    tags?: string[];
  }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewLinkDialogOpen, setViewLinkDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRow | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch agents with filters
  const { data: agents, isLoading: agentsLoading, error: agentsError } = useAgents({
    search: debouncedSearch || undefined,
    status: filters.status,
    tags: filters.tags,
  });

  // Fetch usage stats
  const { data: usageStats, isLoading: statsLoading } = useAgentUsageStats();

  const duplicateAgent = useDuplicateAgent();

  // Extract unique tags from all agents
  const availableTags = useMemo(() => {
    if (!agents) return [];
    const tagSet = new Set<string>();
    agents.forEach((agent) => {
      agent.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [agents]);

  // Format last activity
  const formatLastActivity = (dateString: string | null) => {
    if (!dateString) return "Never";
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  // Handle agent actions
  const handleViewLink = (agent: AgentRow) => {
    if (agent.status === "published" && agent.publish?.publicUrl) {
      setSelectedAgent(agent);
      setViewLinkDialogOpen(true);
    } else {
      // Navigate to edit page to publish first
      navigate(`/agent/${agent.id}/edit`);
    }
  };

  const handleDuplicate = async (agentId: string) => {
    try {
      await duplicateAgent.mutateAsync(agentId);
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = (agent: AgentRow) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  // Mock chart data (in real app, this would come from API)
  const chartData = [
    { name: "Week 1", sessions: 45 },
    { name: "Week 2", sessions: 52 },
    { name: "Week 3", sessions: 48 },
    { name: "Week 4", sessions: 61 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-h2">Dashboard</h1>
            <p className="text-muted mt-1">Manage your conversational agents</p>
          </div>
          <Link to="/agent/new">
            <Button size="lg" className="hover:scale-[1.02] transition-transform">
              <Plus className="mr-2 h-5 w-5" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Usage Summary */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">
                  Monthly Sessions
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats?.monthlySessions || 0}
                </div>
                <p className="text-xs text-muted mt-1">
                  {usageStats && usageStats.monthlySessions > 0
                    ? "Active this month"
                    : "No sessions yet"}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">
                  Completion Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats?.completionRate || 0}%
                </div>
                <p className="text-xs text-muted mt-1">
                  {usageStats && usageStats.completionRate > 0
                    ? "Average completion"
                    : "No completions yet"}
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">
                  Active Agents
                </CardTitle>
                <Users className="h-4 w-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats?.activeAgents || 0}
                </div>
                <p className="text-xs text-muted mt-1">
                  {agents
                    ? `${agents.filter((a) => a.status === "published").length} published, ${agents.filter((a) => a.status === "draft").length} draft`
                    : "No agents yet"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sessions Chart */}
        {usageStats && usageStats.monthlySessions > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sessions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis
                    dataKey="name"
                    stroke="rgb(var(--muted))"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="rgb(var(--muted))"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgb(var(--card))",
                      border: "1px solid rgb(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="rgb(var(--primary))"
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Agents List */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h2 className="text-h3">Your Agents</h2>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="search"
                  placeholder="Search agents..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setFilterSidebarOpen(true)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {agentsError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-danger mb-4" />
                <h3 className="text-lg font-semibold mb-2">Error loading agents</h3>
                <p className="text-muted text-center mb-6">
                  {agentsError instanceof Error
                    ? agentsError.message
                    : "Failed to load agents. Please try again."}
                </p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </CardContent>
            </Card>
          ) : agentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-5 w-20" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !agents || agents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted mb-4" />
                <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
                <p className="text-muted text-center mb-6">
                  Create your first conversational agent to start collecting structured data
                </p>
                <Link to="/agent/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Agent
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent, index) => (
                <Card
                  key={agent.id}
                  className="animate-fade-in-up hover:shadow-lg hover:-translate-y-1 transition-all"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={
                              agent.status === "published"
                                ? "default"
                                : agent.status === "draft"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {agent.status}
                          </Badge>
                          {agent.tags && agent.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {agent.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {agent.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{agent.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-surface"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Link to={`/agent/${agent.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem onClick={() => handleViewLink(agent)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Link
                          </DropdownMenuItem>
                          <Link to={`/agent/${agent.id}/sessions`}>
                            <DropdownMenuItem>
                              <BarChart3 className="mr-2 h-4 w-4" />
                              View Sessions
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(agent.id)}
                            disabled={duplicateAgent.isPending}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-danger"
                            onClick={() => handleDelete(agent)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Sessions</span>
                        <span className="font-semibold">{agent.sessions_count || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Last Activity</span>
                        <div className="flex items-center gap-1 text-muted">
                          <Calendar className="h-3 w-3" />
                          <span>{formatLastActivity(agent.last_activity_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link to={`/agent/${agent.id}/edit`}>
                        <Button variant="outline" className="w-full hover:bg-surface">
                          Manage Agent
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSidebar
        open={filterSidebarOpen}
        onOpenChange={setFilterSidebarOpen}
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
      />

      {/* Delete Dialog */}
      {selectedAgent && (
        <DeleteAgentDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          agentId={selectedAgent.id}
          agentName={selectedAgent.name}
        />
      )}

      {/* View Link Dialog */}
      {selectedAgent && (
        <ViewAgentLinkDialog
          open={viewLinkDialogOpen}
          onOpenChange={setViewLinkDialogOpen}
          agentName={selectedAgent.name}
          publicUrl={selectedAgent.publish?.publicUrl || ""}
        />
      )}
    </DashboardLayout>
  );
}
