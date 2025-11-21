import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Download,
  Send,
  Tag,
  Flag,
  MessageSquare,
  FileText,
  CheckCircle2,
  XCircle,
  Trash2,
  User,
  Bot,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { useSession } from '@/hooks/useSessions';
import {
  useSessionMessages,
  useExtractedFields,
  useSessionNotes,
  useWebhookDeliveries,
  useCreateSessionNote,
  useDeleteSessionNote,
} from '@/hooks/useSessionViewer';
import { ExportModal } from '@/components/session-viewer/ExportModal';
import { ResendWebhookDialog } from '@/components/session-viewer/ResendWebhookDialog';
import { TaggingDialog } from '@/components/session-viewer/TaggingDialog';
import { FlagSessionDialog } from '@/components/session-viewer/FlagSessionDialog';
import { Textarea } from '@/components/ui/textarea';
import type { MessageRow } from '@/types/database/session';

export default function SessionViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [resendWebhookOpen, setResendWebhookOpen] = useState(false);
  const [taggingDialogOpen, setTaggingDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [messageFilter, setMessageFilter] = useState<'all' | 'agent' | 'visitor'>('all');
  const [newNote, setNewNote] = useState('');

  const { data: session, isLoading: sessionLoading } = useSession(id || null);
  const { data: messages, isLoading: messagesLoading } = useSessionMessages(id || null);
  const { data: extractedFields, isLoading: fieldsLoading } = useExtractedFields(id || null);
  const { data: notes, isLoading: notesLoading } = useSessionNotes(id || null);
  const { data: webhookDeliveries, isLoading: deliveriesLoading } = useWebhookDeliveries(
    id || null
  );

  const createNote = useCreateSessionNote();
  const deleteNote = useDeleteSessionNote();

  const filteredMessages = useMemo(() => {
    if (!messages) return [];
    if (messageFilter === 'all') return messages;
    return messages.filter((msg) => msg.role === messageFilter);
  }, [messages, messageFilter]);

  const handleAddNote = () => {
    if (!newNote.trim() || !id) return;

    createNote.mutate(
      {
        session_id: id,
        content: newNote.trim(),
      },
      {
        onSuccess: () => {
          setNewNote('');
        },
      }
    );
  };

  const handleDeleteNote = (noteId: string) => {
    if (!id) return;
    deleteNote.mutate({ noteId, sessionId: id });
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
      }, 2000);
    }
  };

  if (sessionLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The session you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">Session Details</h1>
                <Badge
                  variant={
                    session.status === 'completed'
                      ? 'default'
                      : session.status === 'active'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {session.status}
                </Badge>
                {session.flagged && (
                  <Badge variant="destructive">
                    <Flag className="mr-1 h-3 w-3" />
                    Flagged
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span>ID: {session.id.slice(0, 8)}...</span>
                <span>Started: {format(new Date(session.started_at), 'PPp')}</span>
                {session.ended_at && (
                  <span>Ended: {format(new Date(session.ended_at), 'PPp')}</span>
                )}
                <span>
                  Completion: {session.completed_fields_count} / {session.required_fields_count} (
                  {session.completion_rate.toFixed(0)}%)
                </span>
              </div>
              {(session.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(session.tags || []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setExportModalOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" onClick={() => setTaggingDialogOpen(true)}>
                <Tag className="mr-2 h-4 w-4" />
                Tags
              </Button>
              <Button
                variant={session.flagged ? 'destructive' : 'outline'}
                onClick={() => setFlagDialogOpen(true)}
              >
                <Flag className="mr-2 h-4 w-4" />
                {session.flagged ? 'Unflag' : 'Flag'}
              </Button>
              {session.agent_id && (
                <Button variant="outline" onClick={() => setResendWebhookOpen(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  Resend Webhook
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transcript" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="data">Structured Data</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook History</TabsTrigger>
          </TabsList>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Conversation Transcript</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={messageFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMessageFilter('all')}
                    >
                      All
                    </Button>
                    <Button
                      variant={messageFilter === 'agent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMessageFilter('agent')}
                    >
                      Agent
                    </Button>
                    <Button
                      variant={messageFilter === 'visitor' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMessageFilter('visitor')}
                    >
                      Visitor
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No messages found</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredMessages.map((message: MessageRow) => (
                      <div
                        key={message.id}
                        id={`message-${message.id}`}
                        className={`flex gap-3 p-4 rounded-lg transition-all ${
                          message.role === 'agent'
                            ? 'bg-surface'
                            : message.role === 'visitor'
                              ? 'bg-card border border-border'
                              : 'bg-muted/50'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          {message.role === 'agent' ? (
                            <Bot className="h-5 w-5 text-primary" />
                          ) : message.role === 'visitor' ? (
                            <User className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-warning" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium capitalize">
                              {message.role}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                            {message.validation_state && (
                              <Badge
                                variant={
                                  message.validation_state === 'valid'
                                    ? 'default'
                                    : message.validation_state === 'invalid'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                                className="text-xs"
                              >
                                {message.validation_state}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          {message.validation_errors && (
                            <div className="mt-2 text-xs text-danger">
                              {JSON.stringify(message.validation_errors, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structured Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Extracted Fields</CardTitle>
              </CardHeader>
              <CardContent>
                {fieldsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !extractedFields || extractedFields.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No extracted fields found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {extractedFields.map((field) => (
                      <div
                        key={field.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{field.field_label}</h4>
                            <p className="text-xs text-muted-foreground">
                              {field.field_type} • Confidence: {field.confidence_score?.toFixed(0) || 'N/A'}%
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {field.is_valid ? (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Valid
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Invalid
                              </Badge>
                            )}
                            {field.source_message_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => scrollToMessage(field.source_message_id!)}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium">Value:</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {field.value || <span className="italic">No value</span>}
                          </p>
                          {field.raw_value && field.raw_value !== field.value && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Raw: {field.raw_value}
                            </p>
                          )}
                        </div>
                        {field.validation_errors && (
                          <div className="mt-2 text-xs text-danger">
                            Errors: {JSON.stringify(field.validation_errors, null, 2)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal note about this session..."
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || createNote.isPending}
                    size="sm"
                  >
                    {createNote.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      'Add Note'
                    )}
                  </Button>
                </div>
                <div className="space-y-3">
                  {notesLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : !notes || notes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notes yet</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(note.created_at), 'PPp')}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteNote(note.id)}
                            disabled={deleteNote.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhook History Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Delivery History</CardTitle>
              </CardHeader>
              <CardContent>
                {deliveriesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : !webhookDeliveries || webhookDeliveries.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No webhook deliveries found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhookDeliveries.map((delivery) => (
                      <div
                        key={delivery.id}
                        className="p-4 rounded-lg border border-border bg-card"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  delivery.status === 'success'
                                    ? 'default'
                                    : delivery.status === 'failed'
                                      ? 'destructive'
                                      : 'secondary'
                                }
                              >
                                {delivery.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Attempt {delivery.attempt_number} / {delivery.max_attempts}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{delivery.request_url}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(delivery.started_at), 'PPp')}
                            </p>
                          </div>
                        </div>
                        {delivery.response_status && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Response: </span>
                            <span
                              className={
                                delivery.response_status >= 200 && delivery.response_status < 300
                                  ? 'text-success'
                                  : 'text-danger'
                              }
                            >
                              {delivery.response_status}
                            </span>
                          </div>
                        )}
                        {delivery.error_message && (
                          <div className="mt-2 text-xs text-danger">
                            Error: {delivery.error_message}
                          </div>
                        )}
                        {delivery.duration_ms && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Duration: {delivery.duration_ms}ms
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <ExportModal
          open={exportModalOpen}
          onOpenChange={setExportModalOpen}
          sessionId={session.id}
        />
        {session.agent_id && (
          <ResendWebhookDialog
            open={resendWebhookOpen}
            onOpenChange={setResendWebhookOpen}
            sessionId={session.id}
            agentId={session.agent_id}
          />
        )}
        <TaggingDialog
          open={taggingDialogOpen}
          onOpenChange={setTaggingDialogOpen}
          session={session}
        />
        <FlagSessionDialog
          open={flagDialogOpen}
          onOpenChange={setFlagDialogOpen}
          session={session}
        />
      </div>
    </DashboardLayout>
  );
}
