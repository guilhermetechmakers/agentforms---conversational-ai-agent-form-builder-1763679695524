import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatTranscript } from '@/components/chat/ChatTranscript';
import { ChatInput } from '@/components/chat/ChatInput';
import { ProgressIndicator } from '@/components/chat/ProgressIndicator';
import { PrivacyNotice } from '@/components/chat/PrivacyNotice';
import { EndSessionDialog } from '@/components/chat/EndSessionDialog';
import { EmailOTPGate } from '@/components/chat/EmailOTPGate';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePublicAgent, useCreateSession, useUpdateSession, useSession } from '@/hooks/useSessions';
import { useMessages, useCreateMessage, useMessageSubscription } from '@/hooks/useMessages';
import { useStreamingMessage } from '@/hooks/useStreamingMessage';
import { subscribeToSession, createExtractedField } from '@/api/sessions';
import { generateAgentResponse, validateFieldValue } from '@/api/llm';
import { generateSessionId } from '@/lib/supabase';
import { extractFieldsFromMessages, calculateCompletionRate, getNextRequiredField } from '@/lib/fieldExtraction';
import { checkRateLimit, detectAbusePattern } from '@/lib/rateLimit';
import { AlertCircle, Loader2 } from 'lucide-react';
import type { AgentField } from '@/types/agent';
import type { MessageRow } from '@/types/database/session';

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
  const [emailVerified, setEmailVerified] = useState(false);
  const extractedFieldsRef = useRef<Record<string, string>>({});
  const sessionCreatedRef = useRef(false);
  const processingRef = useRef(false);
  
  // Session queries
  const { data: session } = useSession(sessionId);
  const { data: messages = [] } = useMessages(sessionId);
  const createSessionMutation = useCreateSession();
  const updateSessionMutation = useUpdateSession();
  const createMessageMutation = useCreateMessage();
  
  // Streaming message hook
  const { isStreaming, streamingContent, startStreaming } = useStreamingMessage({
    sessionId: sessionId || '',
    onComplete: () => {
      setIsTyping(false);
    },
    onError: (error) => {
      setIsTyping(false);
      toast.error('Failed to get response. Please try again.');
      console.error('Streaming error:', error);
    },
  });
  
  // Subscribe to real-time updates
  useMessageSubscription(sessionId);
  
  // Check if email OTP is required
  const requiresEmailOTP = agent?.publish?.emailOTPEnabled && !emailVerified;
  
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
  
  // Create session on mount (after email verification if required)
  useEffect(() => {
    if (!agent || sessionId || sessionCreatedRef.current || requiresEmailOTP) return;
    
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
        } else {
          // Generate initial greeting using LLM
          const context = {
            agent,
            messages: [],
            extractedFields: {},
            sessionId: newSession.id,
          };
          
          const response = await generateAgentResponse(context, '');
          await createMessageMutation.mutateAsync({
            session_id: newSession.id,
            role: 'agent',
            content: response.content,
            metadata: { type: 'greeting' },
          });
        }
      } catch (error) {
        console.error('Failed to create session:', error);
        sessionCreatedRef.current = false;
        toast.error('Failed to start session. Please try again.');
      }
    };
    
    createNewSession();
  }, [agent, sessionId, visitorId, createSessionMutation, createMessageMutation, requiresEmailOTP]);
  
  // Extract fields and calculate progress
  useEffect(() => {
    if (!agent || !messages.length || !sessionId) return;
    
    let isMounted = true;
    
    const extractAndUpdate = async () => {
      try {
        // Extract fields using LLM
        const extracted = await extractFieldsFromMessages(messages, agent.schema);
        
        if (!isMounted) return;
        
        extractedFieldsRef.current = extracted;
        
        // Calculate completion
        const completion = calculateCompletionRate(extracted, agent.schema);
        
        // Update session if progress changed
        if (session) {
          const currentCompleted = session.completed_fields_count || 0;
          if (completion.completed !== currentCompleted) {
            await updateSessionMutation.mutateAsync({
              sessionId,
              updates: {
                completed_fields_count: completion.completed,
                completion_rate: completion.rate,
              },
            });
          }
        }
        
        // Save extracted fields to database
        for (const [fieldId, value] of Object.entries(extracted)) {
          const field = agent.schema.fields.find((f: AgentField) => f.id === fieldId);
          if (field) {
            const validation = validateFieldValue(value, field);
            const lastVisitorMessage = [...messages]
              .reverse()
              .find((m) => m.role === 'visitor');
            
            try {
              await createExtractedField({
                session_id: sessionId,
                agent_id: agent.id,
                field_id: fieldId,
                field_label: field.label,
                field_type: field.type,
                value: value,
                raw_value: lastVisitorMessage?.content || value,
                is_valid: validation.isValid,
                validation_errors: validation.errors.length > 0 ? { errors: validation.errors } : null,
                confidence_score: 85, // Would come from LLM in production
                source_message_id: lastVisitorMessage?.id || null,
              });
            } catch (error) {
              console.warn('Failed to save extracted field:', error);
            }
          }
        }
      } catch (error) {
        console.error('Failed to extract fields:', error);
      }
    };
    
    extractAndUpdate();
    
    return () => {
      isMounted = false;
    };
  }, [messages, agent, sessionId, session, updateSessionMutation]);
  
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
    
    const completion = calculateCompletionRate(extractedFieldsRef.current, agent.schema);
    return { completed: completion.completed, total: completion.total };
  }, [session, agent, messages]);
  
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
    if (!sessionId || !agent || processingRef.current) return;
    
    // Check rate limiting
    const rateLimit = checkRateLimit(`session_${sessionId}`, {
      max: 30,
      window: 60 * 1000, // 30 messages per minute
    });
    
    if (!rateLimit.allowed) {
      setRateLimitError(
        `Rate limit exceeded. Please wait ${rateLimit.retryAfter} seconds before sending another message.`
      );
      return;
    }
    
    // Check for abuse patterns
    const abuseCheck = detectAbusePattern(
      messages.map((m) => ({
        content: m.content,
        createdAt: m.created_at,
      })),
      20
    );
    
    if (abuseCheck.isAbuse) {
      setRateLimitError(abuseCheck.reason || 'Unusual activity detected. Please slow down.');
      return;
    }
    
    setRateLimitError(null);
    setIsTyping(true);
    processingRef.current = true;
    
    try {
      // Create visitor message
      const visitorMessage = await createMessageMutation.mutateAsync({
        session_id: sessionId,
        role: 'visitor',
        content,
        metadata: {},
      });
      
      // Build conversation context
      const context = {
        agent,
        messages: [...messages, visitorMessage],
        extractedFields: extractedFieldsRef.current,
        sessionId,
      };
      
      // Generate agent response using LLM with streaming
      startStreaming(context, content);
      
      // Also create the final message once streaming completes
      // This is handled by the streaming hook
      
    } catch (error: any) {
      setIsTyping(false);
      processingRef.current = false;
      
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        setRateLimitError('Rate limit exceeded. Please wait a moment before sending another message.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      // Reset processing flag after a delay to allow streaming to complete
      setTimeout(() => {
        processingRef.current = false;
      }, 2000);
    }
  }, [sessionId, agent, messages, createMessageMutation, startStreaming]);
  
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
  
  // Handle email verification
  const handleEmailVerified = useCallback(() => {
    setEmailVerified(true);
    // Reset session creation flag to allow session creation
    sessionCreatedRef.current = false;
  }, []);
  
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
  
  // Show email OTP gate if required
  if (requiresEmailOTP) {
    return (
      <EmailOTPGate
        open={true}
        onVerified={handleEmailVerified}
        agentName={agentName}
      />
    );
  }
  
  // Combine messages with streaming content
  const displayMessages = useMemo(() => {
    if (isStreaming && streamingContent) {
      // Add temporary streaming message
      const streamingMessage: MessageRow = {
        id: `streaming-${Date.now()}`,
        session_id: sessionId || '',
        role: 'agent',
        content: streamingContent,
        metadata: { streaming: true },
        validation_state: null,
        validation_errors: null,
        created_at: new Date().toISOString(),
      };
      return [...messages, streamingMessage];
    }
    return messages;
  }, [messages, isStreaming, streamingContent, sessionId]);
  
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
        messages={displayMessages}
        isTyping={isTyping && !isStreaming}
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
        disabled={!sessionId || isTyping || createMessageMutation.isPending || processingRef.current}
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
