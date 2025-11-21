import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  Filter,
  Webhook,
} from 'lucide-react';
import { WebhookForm } from '@/components/webhooks/WebhookForm';
import { WebhookRow } from '@/components/webhooks/WebhookRow';
import { useWebhooks } from '@/hooks/useWebhooks';
import { useDebounce } from '@/hooks/useDebounce';
import type { WebhookRow as WebhookRowType } from '@/types/database/webhook';

export default function WebhookSettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<boolean | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookRowType | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: webhooks, isLoading } = useWebhooks({
    enabled: filterEnabled,
  });

  const filteredWebhooks = useMemo(() => {
    if (!webhooks) return [];

    return webhooks.filter((webhook) => {
      const matchesSearch =
        !debouncedSearch ||
        webhook.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        webhook.url.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesSearch;
    });
  }, [webhooks, debouncedSearch]);

  const stats = useMemo(() => {
    if (!webhooks) {
      return {
        total: 0,
        enabled: 0,
        disabled: 0,
        successful: 0,
        failed: 0,
      };
    }

    return {
      total: webhooks.length,
      enabled: webhooks.filter((w) => w.enabled).length,
      disabled: webhooks.filter((w) => !w.enabled).length,
      successful: webhooks.filter(
        (w) => w.last_delivery_status === 'success'
      ).length,
      failed: webhooks.filter((w) => w.last_delivery_status === 'failed').length,
    };
  }, [webhooks]);

  const handleCreate = () => {
    setEditingWebhook(null);
    setFormOpen(true);
  };

  const handleEdit = (webhook: WebhookRowType) => {
    setEditingWebhook(webhook);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingWebhook(null);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1">Webhook & Integration Settings</h1>
              <p className="text-muted-foreground mt-2">
                Configure webhooks to receive notifications when events occur in your agents.
              </p>
            </div>
            <Button onClick={handleCreate} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Webhooks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Enabled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'rgb(var(--success))' }}>{stats.enabled}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Disabled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">
                  {stats.disabled}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Successful
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'rgb(var(--success))' }}>
                  {stats.successful}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Failed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" style={{ color: 'rgb(var(--danger))' }}>{stats.failed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>Webhooks</CardTitle>
              <CardDescription>
                Manage your webhook configurations and monitor delivery status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search webhooks by name or URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Button
                    variant={filterEnabled === undefined ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterEnabled(undefined)}
                  >
                    All
                  </Button>
                  <Button
                    variant={filterEnabled === true ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterEnabled(true)}
                  >
                    Enabled
                  </Button>
                  <Button
                    variant={filterEnabled === false ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterEnabled(false)}
                  >
                    Disabled
                  </Button>
                </div>
              </div>

              {/* Webhook List */}
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
              ) : filteredWebhooks.length === 0 ? (
                <div className="text-center py-12">
                  <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No webhooks found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterEnabled !== undefined
                      ? 'Try adjusting your search or filters.'
                      : 'Get started by creating your first webhook.'}
                  </p>
                  {!searchQuery && filterEnabled === undefined && (
                    <Button onClick={handleCreate} className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Webhook
                    </Button>
                  )}
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 items-center p-4 bg-surface border-b border-border font-semibold text-sm">
                    <div className="col-span-3">Name & URL</div>
                    <div className="col-span-2">Agent</div>
                    <div className="col-span-2">Triggers</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-center">Deliveries</div>
                    <div className="col-span-1 text-center">Enabled</div>
                    <div className="col-span-1"></div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-border">
                    {filteredWebhooks.map((webhook) => (
                      <WebhookRow
                        key={webhook.id}
                        webhook={webhook}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>About Webhooks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Webhooks allow you to receive real-time notifications when events occur
                in your agents. Configure webhooks to integrate with external systems,
                trigger workflows, or log events.
              </p>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Available Triggers:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <strong>session.completed</strong> - Fired when a session is completed
                  </li>
                  <li>
                    <strong>session.started</strong> - Fired when a new session begins
                  </li>
                  <li>
                    <strong>field.extracted</strong> - Fired when a field value is extracted
                  </li>
                  <li>
                    <strong>session.abandoned</strong> - Fired when a session is abandoned
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Security:</h4>
                <p>
                  Use the secret field to configure HMAC signing for webhook payloads.
                  This allows you to verify that webhooks are coming from AgentForms.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Webhook Form Modal */}
      <WebhookForm
        open={formOpen}
        onOpenChange={handleFormClose}
        webhook={editingWebhook}
      />
    </DashboardLayout>
  );
}
