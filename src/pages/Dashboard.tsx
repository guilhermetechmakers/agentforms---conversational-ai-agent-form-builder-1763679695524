import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with actual API calls
const mockAgents = [
  {
    id: "1",
    name: "Lead Qualifier",
    status: "published" as const,
    sessionsCount: 142,
    lastActivity: "2 hours ago",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Demo Scheduler",
    status: "published" as const,
    sessionsCount: 89,
    lastActivity: "1 day ago",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Support Intake",
    status: "draft" as const,
    sessionsCount: 0,
    lastActivity: "3 days ago",
    createdAt: "2024-01-20",
  },
];

const usageStats = {
  monthlySessions: 231,
  completionRate: 78,
  activeAgents: 2,
};

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h2">Dashboard</h1>
            <p className="text-muted mt-1">Manage your conversational agents</p>
          </div>
          <Link to="/agent/new">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Agent
            </Button>
          </Link>
        </div>

        {/* Usage Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">Monthly Sessions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.monthlySessions}</div>
              <p className="text-xs text-muted mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">Completion Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.completionRate}%</div>
              <p className="text-xs text-muted mt-1">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted">Active Agents</CardTitle>
              <Users className="h-4 w-4 text-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usageStats.activeAgents}</div>
              <p className="text-xs text-muted mt-1">2 published, 1 draft</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h3">Your Agents</h2>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                <Input
                  type="search"
                  placeholder="Search agents..."
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>

          {mockAgents.length === 0 ? (
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
              {mockAgents.map((agent, index) => (
                <Card
                  key={agent.id}
                  className="animate-fade-in-up hover:shadow-lg transition-all cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{agent.name}</CardTitle>
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
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
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
                          <DropdownMenuItem>
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
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-danger">
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
                        <span className="font-semibold">{agent.sessionsCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted">Last Activity</span>
                        <div className="flex items-center gap-1 text-muted">
                          <Calendar className="h-3 w-3" />
                          <span>{agent.lastActivity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Link to={`/agent/${agent.id}/edit`}>
                        <Button variant="outline" className="w-full">
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
    </DashboardLayout>
  );
}
