import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, GripVertical, Tag, Folder } from "lucide-react";
import { useKnowledgeSnippets, useCreateKnowledgeSnippet, useUpdateKnowledgeSnippet, useDeleteKnowledgeSnippet } from "@/hooks/useKnowledgeSnippets";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { KnowledgeSnippetRow } from "@/types/database/knowledge-snippet";

interface KnowledgeSnippetManagerProps {
  agentId: string;
}

const snippetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().optional(),
  tags: z.string().optional(),
});

type SnippetFormData = z.infer<typeof snippetSchema>;

export function KnowledgeSnippetManager({ agentId }: KnowledgeSnippetManagerProps) {
  const { data: snippets, isLoading } = useKnowledgeSnippets(agentId);
  const createSnippet = useCreateKnowledgeSnippet();
  const updateSnippet = useUpdateKnowledgeSnippet();
  const deleteSnippet = useDeleteKnowledgeSnippet();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<KnowledgeSnippetRow | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SnippetFormData>({
    resolver: zodResolver(snippetSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      tags: "",
    },
  });

  const handleOpenDialog = (snippet?: KnowledgeSnippetRow) => {
    if (snippet) {
      setEditingSnippet(snippet);
      reset({
        title: snippet.title,
        content: snippet.content,
        category: snippet.category || "",
        tags: snippet.tags.join(", "),
      });
    } else {
      setEditingSnippet(null);
      reset({
        title: "",
        content: "",
        category: "",
        tags: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSnippet(null);
    reset();
  };

  const onSubmit = async (data: SnippetFormData) => {
    try {
      const tags = data.tags
        ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : [];

      if (editingSnippet) {
        await updateSnippet.mutateAsync({
          id: editingSnippet.id,
          updates: {
            title: data.title,
            content: data.content,
            category: data.category || null,
            tags,
          },
        });
      } else {
        await createSnippet.mutateAsync({
          agent_id: agentId,
          title: data.title,
          content: data.content,
          category: data.category || null,
          tags,
        });
      }
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error.message || "Failed to save knowledge snippet");
    }
  };

  const handleDelete = async (snippet: KnowledgeSnippetRow) => {
    if (!confirm(`Are you sure you want to delete "${snippet.title}"?`)) {
      return;
    }

    try {
      await deleteSnippet.mutateAsync({
        id: snippet.id,
        agentId,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to delete knowledge snippet");
    }
  };

  // Group snippets by category
  const groupedSnippets = snippets?.reduce((acc, snippet) => {
    const category = snippet.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(snippet);
    return acc;
  }, {} as Record<string, KnowledgeSnippetRow[]>) || {};

  const categories = Object.keys(groupedSnippets);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-muted-foreground">Loading knowledge snippets...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-h3">Knowledge Snippets</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Manage individual knowledge snippets with categories and tags
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Snippet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSnippet ? "Edit Knowledge Snippet" : "Add Knowledge Snippet"}
              </DialogTitle>
              <DialogDescription>
                {editingSnippet
                  ? "Update the knowledge snippet details"
                  : "Create a new knowledge snippet for your agent"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Product FAQ, Pricing Information"
                />
                {errors.title && (
                  <p className="text-sm text-danger">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Enter the knowledge snippet content..."
                  rows={8}
                  className="font-mono text-sm"
                />
                {errors.content && (
                  <p className="text-sm text-danger">{errors.content.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...register("category")}
                  placeholder="e.g., FAQ, Documentation, Policies"
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Group snippets by category
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  {...register("tags")}
                  placeholder="e.g., pricing, support, features (comma-separated)"
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingSnippet ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {snippets && snippets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-h4 mb-2">No Knowledge Snippets</h4>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first knowledge snippet
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Snippet
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  {category}
                </CardTitle>
                <CardDescription>
                  {groupedSnippets[category].length} snippet
                  {groupedSnippets[category].length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groupedSnippets[category].map((snippet) => (
                    <div
                      key={snippet.id}
                      className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-surface transition-colors"
                    >
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground mb-1">{snippet.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {snippet.content}
                        </p>
                        {snippet.tags && snippet.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {snippet.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(snippet)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(snippet)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
