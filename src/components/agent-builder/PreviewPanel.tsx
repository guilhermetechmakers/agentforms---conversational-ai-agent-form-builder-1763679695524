import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, MessageSquare, Send } from "lucide-react";
import type { AgentSchema, AgentPersona, AgentVisuals } from "@/types/agent";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  schema: AgentSchema;
  persona: AgentPersona;
  visuals: AgentVisuals;
}

export function PreviewPanel({ schema, persona, visuals }: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [messages, setMessages] = useState<Array<{ role: "agent" | "visitor"; content: string }>>([
    { role: "agent", content: visuals.welcomeMessage || "Welcome! How can I help you today?" },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages, { role: "visitor", content: inputValue }]);
    setInputValue("");

    // Simulate agent response
    setTimeout(() => {
      const nextField = schema.fields.find(
        (field) => !messages.some((m) => m.content.toLowerCase().includes(field.label.toLowerCase()))
      );
      if (nextField) {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: `Thanks! Now, could you please provide your ${nextField.label.toLowerCase()}?`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "agent",
            content: "Thank you for providing all the information! Is there anything else I can help you with?",
          },
        ]);
      }
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-h3">Live Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={viewMode === "desktop" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("desktop")}
          >
            <Monitor className="h-4 w-4 mr-2" />
            Desktop
          </Button>
          <Button
            type="button"
            variant={viewMode === "mobile" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("mobile")}
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Mobile
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {visuals.avatarUrl ? (
              <img
                src={visuals.avatarUrl}
                alt={persona.name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: visuals.primaryColor }}
              >
                {persona.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{persona.name}</CardTitle>
              <p className="text-xs text-muted-foreground">Preview Mode</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            className={cn(
              "bg-background border-t border-border",
              viewMode === "desktop" ? "h-[600px]" : "h-[500px] max-w-sm mx-auto"
            )}
          >
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-2",
                      message.role === "visitor" && "justify-end"
                    )}
                  >
                    {message.role === "agent" && (
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: visuals.primaryColor }}
                      >
                        {visuals.avatarUrl ? (
                          <img
                            src={visuals.avatarUrl}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          persona.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 max-w-[80%]",
                        message.role === "agent"
                          ? "bg-surface text-foreground"
                          : "text-white"
                      )}
                      style={
                        message.role === "visitor"
                          ? { backgroundColor: visuals.primaryColor }
                          : undefined
                      }
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 h-10 rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleSendMessage}
                    style={{ backgroundColor: visuals.primaryColor }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>
          {schema.fields.length} field{schema.fields.length !== 1 ? "s" : ""} defined
        </span>
      </div>
    </div>
  );
}
