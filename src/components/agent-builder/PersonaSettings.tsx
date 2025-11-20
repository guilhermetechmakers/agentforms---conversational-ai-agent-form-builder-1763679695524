import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import type { AgentPersona } from "@/types/agent";

interface PersonaSettingsProps {
  persona: AgentPersona;
  onChange: (persona: AgentPersona) => void;
}

const TONE_OPTIONS = [
  { value: "friendly", label: "Friendly" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
];

export function PersonaSettings({ persona, onChange }: PersonaSettingsProps) {
  const [newMessage, setNewMessage] = useState("");

  const handleAddSampleMessage = () => {
    if (newMessage.trim()) {
      onChange({
        ...persona,
        sampleMessages: [...(persona.sampleMessages || []), newMessage.trim()],
      });
      setNewMessage("");
    }
  };

  const handleRemoveSampleMessage = (index: number) => {
    onChange({
      ...persona,
      sampleMessages: persona.sampleMessages?.filter((_, i) => i !== index) || [],
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-h3">Persona & Behavior</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Define how your agent communicates with visitors
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Set the agent's name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="persona-name">Agent Name *</Label>
            <Input
              id="persona-name"
              value={persona.name}
              onChange={(e) => onChange({ ...persona, name: e.target.value })}
              placeholder="e.g., Support Assistant, Lead Qualifier"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="persona-description">Persona Description *</Label>
            <Textarea
              id="persona-description"
              value={persona.description}
              onChange={(e) => onChange({ ...persona, description: e.target.value })}
              placeholder="Describe the agent's personality, role, and communication style..."
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              This description helps the AI understand how to communicate in character
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication Tone</CardTitle>
          <CardDescription>Select the default tone for conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone Preset *</Label>
            <Select
              value={persona.tone}
              onValueChange={(value) =>
                onChange({ ...persona, tone: value as AgentPersona["tone"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    {tone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Messages</CardTitle>
          <CardDescription>
            Add example messages to guide the agent's communication style
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sample-message">Add Sample Message</Label>
            <div className="flex gap-2">
              <Input
                id="sample-message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="e.g., 'Hi! I'm here to help you get started...'"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddSampleMessage();
                  }
                }}
              />
              <Button type="button" onClick={handleAddSampleMessage} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {persona.sampleMessages && persona.sampleMessages.length > 0 && (
            <div className="space-y-2">
              <Label>Sample Messages</Label>
              <div className="space-y-2">
                {persona.sampleMessages.map((message, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-surface rounded-lg"
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="flex-1 text-sm">{message}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSampleMessage(index)}
                    >
                      <Trash2 className="h-4 w-4 text-danger" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
