import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatTranscript } from '@/components/chat/ChatTranscript';
import { ChatInput } from '@/components/chat/ChatInput';
import { ProgressIndicator } from '@/components/chat/ProgressIndicator';
import { PrivacyNotice } from '@/components/chat/PrivacyNotice';
import { EndSessionDialog } from '@/components/chat/EndSessionDialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePublicAgent, useCreateSession, useUpdateSession, useSession } from '@/hooks/useSessions';
import { useMessages, useCreateMessage, useMessageSubscription } from '@/hooks/useMessages';
import { subscribeToSession } from '@/api/sessions';
import { generateSessionId } from '@/lib/supabase';
import { extractFieldsFromMessages, calculateCompletionRate, getNextRequiredField } from '@/lib/fieldExtraction';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { AgentField } from '@/types/agent';

export default function PublicAgentSession() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Get agent by slug
  const { data: agent, isLoading: isLoadingAgent, error: agentError } = usePublicAgent(slug || '') as {
    data: any;
    isLoading: boolean;
    error: Error | null;
  };
  
  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId] = useState(() => generateSessionId());
  const [isTyping, setIsTyping] = useState(false);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [endSessionDialogOpen, setEndSessionDialogOpen] = useState(false);
  const extractedFieldsRef = useRef<Record<string, string>>({});
  const sessionCreatedRef = useRef(false);
  
  // Session queries
  const { data: session } = useSession(sessionId);
  const { data: messages = [] } = useMessages(sessionId);
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();
  const createMessageMutation = useCreateMessage();
  
  // Subscribe to real-time updates
  useMessageSubscription(sessionId);
  
  // Subscribe to session updates
  useEffect(() => {
    if (!sessionId) return;
    
    const unsubscribe = subscribeToSession(sessionId, () => {
      // Session updated, could trigger refetch if needed
    });
    
    return () => {
      unsubscribe();
    };
  }, [sessionId]);
  
  // Create session on mount
  useEffect(() => {
    if (!agent || sessionId || sessionCreatedRef.current) return;
    
    const createNewSession = async () => {
      sessionCreatedRef.current = true;
      
      try {
        // Get visitor info
        const ipAddress = null; // Could be fetched from a service
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || null;
        
        // Calculate required fields count
        const requiredFieldsCount = agent.schema?.fields?.filter((f: AgentField) => f.required).length || 0;
        
        const newSession = await createSessionMutation.mutateAsync({
          agent_id: agent.id,
          visitor_id: visitorId,
          status: 'active',
          ip_address: ipAddress,
          user_agent: userAgent,
          referrer: referrer,
          required_fields_count: requiredFieldsCount,
          completed_fields_count: 0,
          completion_rate: 0,
        });
        
        setSessionId(newSession.id);
        
        // Send welcome message if configured
        if (agent.visuals?.welcomeMessage) {
          await createMessageMutation.mutateAsync({
            session_id: newSession.id,
            role: 'agent',
            content: agent.visuals.welcomeMessage,
            metadata: { type: 'welcome' },
          });
        }
      } catch (error) {
        console.error('Failed to create session:', error);
        sessionCreatedRef.current = false;
        toast.error('Failed to start session. Please try again.');
      }
    };
    
    createNewSession();
  }, [agent, sessionId, visitorId, createSessionMutation, createMessageMutation]);
  
  // Calculate progress from extracted fields
  const progress = useMemo(() => {
    if (!agent || !messages.length) {
      if (session) {
        return {
          completed: session.completed_fields_count || 0,
          total: session.required_fields_count || 0,
        };
      }
      return { completed: 0, total: 0 };
    }
    
    // Extract fields from messages
    const extracted = extractFieldsFromMessages(messages, agent.schema);
    extractedFieldsRef.current = extracted;
    
    // Calculate completion
    const completion = calculateCompletionRate(extracted, agent.schema);
    
    // Update session if progress changed
    if (sessionId && session) {
      const currentCompleted = session.completed_fields_count || 0;
      if (completion.completed !== currentCompleted) {
        updateSessionMutation.mutate({
          sessionId,
          updates: {
            completed_fields_count: completion.completed,
            completion_rate: completion.rate,
          },
        });
      }
    }
    
    return { completed: completion.completed, total: completion.total };
  }, [session, agent, messages, sessionId, updateSessionMutation]);
  
  // Get quick replies for current field
  const quickReplies = useMemo(() => {
    if (!agent || !messages.length) return [];
    
    // Get the next required field that needs to be completed
    const nextField = getNextRequiredField(extractedFieldsRef.current, agent.schema);
    
    if (nextField?.type === 'select' && nextField.options) {
      return nextField.options;
    }
    
    return [];
  }, [agent, messages]);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async (content: string) => {
    if (!sessionId || !agent) return;
    
    setRateLimitError(null);
    setIsTyping(true);
    
    try {
      // Create visitor message
      await createMessageMutation.mutateAsync({
        session_id: sessionId,
        role: 'visitor',
        content,
        metadata: {},
      });
      
      // Simulate agent response (in real implementation, this would call an LLM API)
      // For now, we'll create a simple response based on the next required field
      setTimeout(async () => {
        try {
          if (!agent) return;
          
          // Get next required field
          const nextField = getNextRequiredField(extractedFieldsRef.current, agent.schema);
          
          let agentResponse: string;
          
          if (nextField) {
            // Ask for the next required field
            agentResponse = nextField.placeholder || `Please provide your ${nextField.label.toLowerCase()}.`;
            if (nextField.helpText) {
              agentResponse += ` ${nextField.helpText}`;
            }
          } else {
            // All required fields completed
            agentResponse = 'Thank you! All required information has been collected. Is there anything else you\'d like to share?';
          }
          
          await createMessageMutation.mutateAsync({
            session_id: sessionId,
            role: 'agent',
            content: agentResponse,
            metadata: { type: 'question', fieldId: nextField?.id },
          });
          
        } catch (error) {
          console.error('Failed to create agent message:', error);
          toast.error('Failed to get response. Please try again.');
        } finally {
          setIsTyping(false);
        }
      }, 1000);
      
    } catch (error: any) {
      setIsTyping(false);
      
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        setRateLimitError('Rate limit exceeded. Please wait a moment before sending another message.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    }
  }, [sessionId, agent, createMessageMutation]);
  
  // Handle file upload
  const handleFileUpload = useCallback(async (_file: File) => {
    if (!sessionId) return;
    
    // In real implementation, you'd upload the file and create a message with the file reference
    toast.info('File upload feature coming soon');
  }, [sessionId]);
  
  // Handle ending session
  const handleEndSession = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      await updateSessionMutation.mutateAsync({
        sessionId,
        updates: {
          status: 'completed',
          ended_at: new Date().toISOString(),
        },
      });
      
      toast.success('Session completed successfully');
      setEndSessionDialogOpen(false);
      
      // Optionally redirect after a delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      console.error('Failed to end session:', error);
      toast.error('Failed to end session. Please try again.');
    }
  }, [sessionId, updateSessionMutation, navigate]);
  
  // Handle getting transcript
  const handleGetTranscript = useCallback(() => {
    if (!sessionId || !messages.length) return;
    
    // Create transcript text
    const transcript = messages
      .map((m) => {
        const role = m.role === 'agent' ? agent?.persona?.name || 'Agent' : 'You';
        const time = new Date(m.created_at).toLocaleTimeString();
        return `[${time}] ${role}: ${m.content}`;
      })
      .join('\n\n');
    
    // Download as text file
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-transcript-${sessionId.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Transcript downloaded');
  }, [sessionId, messages, agent]);
  
  // Loading state
  if (isLoadingAgent || createSessionMutation.isPending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (agentError || !agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {agentError
              ? 'Failed to load agent. Please check the URL and try again.'
              : 'Agent not found or not published.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const primaryColor = agent.visuals?.primaryColor || '#4F46E5';
  const agentName = agent.persona?.name || agent.name;
  const avatarUrl = agent.visuals?.avatarUrl;
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ChatHeader
        agentName={agentName}
        avatarUrl={avatarUrl}
        logoUrl={agent.visuals?.logoUrl}
        primaryColor={primaryColor}
      />
      
      {rateLimitError && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{rateLimitError}</AlertDescription>
        </Alert>
      )}
      
      {progress.total > 0 && (
        <ProgressIndicator
          completed={progress.completed}
          total={progress.total}
        />
      )}
      
      <ChatTranscript
        messages={messages}
        isTyping={isTyping}
        agentName={agentName}
        avatarUrl={avatarUrl}
        primaryColor={primaryColor}
      />
      
      <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface/30">
        <PrivacyNotice agentName={agentName} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEndSessionDialogOpen(true)}
          disabled={!sessionId}
        >
          End Session
        </Button>
      </div>
      
      <ChatInput
        onSend={handleSendMessage}
        onFileUpload={handleFileUpload}
        disabled={!sessionId || isTyping || createMessageMutation.isPending}
        placeholder="Type your message..."
        quickReplies={quickReplies}
        primaryColor={primaryColor}
      />
      
      <EndSessionDialog
        open={endSessionDialogOpen}
        onOpenChange={setEndSessionDialogOpen}
        onFinish={handleEndSession}
        onGetTranscript={handleGetTranscript}
        canGetTranscript={messages.length > 0}
        isCompleted={progress.completed >= progress.total && progress.total > 0}
      />
    </div>
  );
}
