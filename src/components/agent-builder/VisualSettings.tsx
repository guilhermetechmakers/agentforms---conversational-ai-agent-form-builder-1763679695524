import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Upload, Image as ImageIcon, Palette } from "lucide-react";
import type { AgentVisuals } from "@/types/agent";

interface VisualSettingsProps {
  visuals: AgentVisuals;
  onChange: (visuals: AgentVisuals) => void;
}

export function VisualSettings({ visuals, onChange }: VisualSettingsProps) {
  const [customCSSEnabled, setCustomCSSEnabled] = useState(!!visuals.customCSS);

  const handleColorChange = (color: string) => {
    onChange({ ...visuals, primaryColor: color });
  };

  const handleImageUpload = (
    type: "avatar" | "logo",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a storage service and get the URL
      // For now, we'll create a data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        if (type === "avatar") {
          onChange({ ...visuals, avatarUrl: url });
        } else {
          onChange({ ...visuals, logoUrl: url });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-h3">Visual Branding</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Customize the appearance of your agent
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
          <CardDescription>Set the primary color for your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex items-center gap-4">
              <Input
                id="primary-color"
                type="color"
                value={visuals.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="h-12 w-24 cursor-pointer"
              />
              <Input
                type="text"
                value={visuals.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#4F46E5"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              This color will be used for buttons, accents, and highlights
            </p>
          </div>

          <div className="p-4 bg-surface rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Color Preview</span>
            </div>
            <div
              className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: visuals.primaryColor }}
            >
              Primary Color
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
          <CardDescription>Upload avatar and logo for your agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Agent Avatar</Label>
            <div className="flex items-center gap-4">
              {visuals.avatarUrl ? (
                <div className="relative">
                  <img
                    src={visuals.avatarUrl}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-2 border-border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-danger text-white"
                    onClick={() => onChange({ ...visuals, avatarUrl: undefined })}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Avatar
                    </span>
                  </Button>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("avatar", e)}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 200x200px, square image
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {visuals.logoUrl ? (
                <div className="relative">
                  <img
                    src={visuals.logoUrl}
                    alt="Logo"
                    className="h-16 object-contain border-2 border-border rounded-lg p-2 bg-card"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-danger text-white"
                    onClick={() => onChange({ ...visuals, logoUrl: undefined })}
                  >
                    ×
                  </Button>
                </div>
              ) : (
                <div className="h-16 w-32 bg-surface border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="logo-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </span>
                  </Button>
                </Label>
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload("logo", e)}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: Transparent PNG, max height 60px
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Welcome Message</CardTitle>
          <CardDescription>
            The initial message shown when visitors start a conversation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="welcome-message">Welcome Message *</Label>
            <Textarea
              id="welcome-message"
              value={visuals.welcomeMessage}
              onChange={(e) => onChange({ ...visuals, welcomeMessage: e.target.value })}
              placeholder="Hi! I'm here to help you. How can I assist you today?"
              rows={4}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Styling</CardTitle>
          <CardDescription>
            Add custom CSS for advanced customization (Pro feature)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="custom-css">Enable Custom CSS</Label>
              <p className="text-sm text-muted-foreground">
                Add your own CSS for complete control over styling
              </p>
            </div>
            <Switch
              id="custom-css"
              checked={customCSSEnabled}
              onCheckedChange={(checked) => {
                setCustomCSSEnabled(checked);
                if (!checked) {
                  onChange({ ...visuals, customCSS: undefined });
                }
              }}
            />
          </div>

          {customCSSEnabled && (
            <div className="space-y-2">
              <Label htmlFor="css-content">Custom CSS</Label>
              <Textarea
                id="css-content"
                value={visuals.customCSS || ""}
                onChange={(e) => onChange({ ...visuals, customCSS: e.target.value })}
                placeholder=".agent-container { ... }"
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
