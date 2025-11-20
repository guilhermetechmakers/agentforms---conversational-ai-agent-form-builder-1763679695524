import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import type { AgentPublish } from "@/types/agent";

interface PublishSettingsProps {
  publish: AgentPublish;
  onChange: (publish: AgentPublish) => void;
  agentName?: string;
}

export function PublishSettings({ publish, onChange, agentName }: PublishSettingsProps) {
  const [slug, setSlug] = useState(publish.slug || "");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug && agentName) {
      const generatedSlug = agentName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generatedSlug);
      onChange({ ...publish, slug: generatedSlug });
    }
  }, [agentName]);

  const baseUrl = window.location.origin;
  const publicUrl = slug ? `${baseUrl}/agent/${slug}` : "";

  const handleSlugChange = (newSlug: string) => {
    const sanitized = newSlug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(sanitized);
    onChange({
      ...publish,
      slug: sanitized,
      publicUrl: sanitized ? `${baseUrl}/agent/${sanitized}` : "",
    });
  };

  const handleCopyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-h3">Publish Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Configure how your agent will be accessed and shared
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public URL</CardTitle>
          <CardDescription>Set the unique URL slug for your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{baseUrl}/agent/</span>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-agent"
                required
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Only lowercase letters, numbers, and hyphens allowed
            </p>
          </div>

          {publicUrl && (
            <div className="space-y-2">
              <Label>Public URL</Label>
              <div className="flex items-center gap-2 p-3 bg-surface rounded-lg">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-primary hover:underline flex items-center gap-2"
                >
                  {publicUrl}
                  <ExternalLink className="h-3 w-3" />
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Access Control</CardTitle>
          <CardDescription>Configure how visitors access your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-otp">Email OTP Gating</Label>
              <p className="text-sm text-muted-foreground">
                Require email verification before starting a conversation
              </p>
            </div>
            <Switch
              id="email-otp"
              checked={publish.emailOTPEnabled}
              onCheckedChange={(checked) =>
                onChange({ ...publish, emailOTPEnabled: checked })
              }
            />
          </div>

          {publish.emailOTPEnabled && (
            <div className="flex items-start gap-2 p-3 bg-surface rounded-lg">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Visitors will need to verify their email address before they can start a conversation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
          <CardDescription>
            Receive notifications when sessions are completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              value={publish.webhookUrl || ""}
              onChange={(e) => onChange({ ...publish, webhookUrl: e.target.value })}
              placeholder="https://your-server.com/webhook"
            />
            <p className="text-xs text-muted-foreground">
              Your server endpoint to receive session completion events
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook-secret">Webhook Secret</Label>
            <Input
              id="webhook-secret"
              type="password"
              value={publish.webhookSecret || ""}
              onChange={(e) => onChange({ ...publish, webhookSecret: e.target.value })}
              placeholder="Enter secret for webhook authentication"
            />
            <p className="text-xs text-muted-foreground">
              Secret key for HMAC signature verification
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
          <CardDescription>
            Configure how long session data is retained
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="retention-days">Retention Period (days)</Label>
            <Input
              id="retention-days"
              type="number"
              value={publish.retentionDays || ""}
              onChange={(e) =>
                onChange({
                  ...publish,
                  retentionDays: e.target.value ? parseInt(e.target.value) : undefined,
                })
              }
              placeholder="90"
              min={1}
              max={365}
            />
            <p className="text-xs text-muted-foreground">
              Sessions will be automatically deleted after this period (1-365 days)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
