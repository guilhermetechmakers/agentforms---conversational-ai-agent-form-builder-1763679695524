import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Upload, AlertCircle } from "lucide-react";
import type { AgentKnowledge } from "@/types/agent";

interface KnowledgeInputProps {
  knowledge: AgentKnowledge | undefined;
  onChange: (knowledge: AgentKnowledge | undefined) => void;
}

export function KnowledgeInput({ knowledge, onChange }: KnowledgeInputProps) {
  const [isRAGEnabled, setIsRAGEnabled] = useState(knowledge?.enableRAG || false);

  const handleContentChange = (content: string) => {
    if (content.trim() || knowledge) {
      onChange({
        content: content.trim(),
        enableRAG: isRAGEnabled,
        maxContextTokens: knowledge?.maxContextTokens || 2000,
        citationFlag: knowledge?.citationFlag || false,
      });
    } else {
      onChange(undefined);
    }
  };

  const handleRAGToggle = (enabled: boolean) => {
    setIsRAGEnabled(enabled);
    if (knowledge) {
      onChange({
        ...knowledge,
        enableRAG: enabled,
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleContentChange(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-h3">Knowledge Base</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Provide context and information for your agent to reference
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Content</CardTitle>
          <CardDescription>
            Add FAQs, documentation, or any relevant information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="knowledge-content">Knowledge Base Content</Label>
            <Textarea
              id="knowledge-content"
              value={knowledge?.content || ""}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Paste your FAQs, documentation, or any relevant information here..."
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This content will be used to provide context-aware responses
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button type="button" variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </span>
              </Button>
            </Label>
            <Input
              id="file-upload"
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-sm text-muted-foreground">
              Supports .txt, .md, and .pdf files
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RAG Settings</CardTitle>
          <CardDescription>
            Configure Retrieval-Augmented Generation for better context awareness
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-rag">Enable RAG</Label>
              <p className="text-sm text-muted-foreground">
                Use knowledge base for context-aware responses
              </p>
            </div>
            <Switch
              id="enable-rag"
              checked={isRAGEnabled}
              onCheckedChange={handleRAGToggle}
            />
          </div>

          {isRAGEnabled && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-2">
                <Label htmlFor="max-context-tokens">Max Context Tokens</Label>
                <Input
                  id="max-context-tokens"
                  type="number"
                  value={knowledge?.maxContextTokens || 2000}
                  onChange={(e) =>
                    knowledge &&
                    onChange({
                      ...knowledge,
                      maxContextTokens: parseInt(e.target.value) || 2000,
                    })
                  }
                  min={500}
                  max={8000}
                  step={500}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum tokens to include from knowledge base (500-8000)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="citation-flag"
                  checked={knowledge?.citationFlag || false}
                  onCheckedChange={(checked) =>
                    knowledge &&
                    onChange({
                      ...knowledge,
                      citationFlag: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="citation-flag" className="cursor-pointer">
                  Include citations in responses
                </Label>
              </div>
            </div>
          )}

          {!isRAGEnabled && (
            <div className="flex items-start gap-2 p-3 bg-surface rounded-lg">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                RAG is disabled. The agent will use the knowledge base as general context only.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
