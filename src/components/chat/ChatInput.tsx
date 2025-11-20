import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuickReplyChips } from './QuickReplyChips';

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  disabled?: boolean;
  placeholder?: string;
  quickReplies?: string[];
  primaryColor?: string;
}

export function ChatInput({
  onSend,
  onFileUpload,
  disabled = false,
  placeholder = 'Type your message...',
  quickReplies = [],
  primaryColor = '#4F46E5',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleQuickReply = (option: string) => {
    if (!disabled) {
      onSend(option);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="border-t border-border bg-card">
      {quickReplies.length > 0 && (
        <QuickReplyChips
          options={quickReplies}
          onSelect={handleQuickReply}
          disabled={disabled}
          primaryColor={primaryColor}
        />
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-2 p-4">
        {onFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled}
              accept="image/*,application/pdf,.doc,.docx"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="shrink-0"
            >
              <Paperclip className="h-5 w-5 text-muted-foreground" />
            </Button>
          </>
        )}

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none pr-12',
              isFocused && 'ring-2 ring-ring'
            )}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={!message.trim() || disabled}
          size="icon"
          className="shrink-0"
          style={{ backgroundColor: primaryColor }}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
