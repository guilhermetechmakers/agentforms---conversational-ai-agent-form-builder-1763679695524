import { useState, useEffect } from 'react';
import { Search, BookOpen, HelpCircle, Code, Mail, MessageSquare, FileText, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FAQItem } from '@/components/help-center/FAQItem';
import { SupportForm } from '@/components/help-center/SupportForm';
import { GettingStartedSteps } from '@/components/help-center/GettingStartedSteps';
import { useFAQs, useSearchFAQs, useTrackInteraction } from '@/hooks/useHelpCenter';
import { getHelpCenterSessionId } from '@/api/help-center';
import type { FAQCategory } from '@/types/database/faq';
import { Skeleton } from '@/components/ui/skeleton';

const FAQ_CATEGORIES: { value: FAQCategory | 'all'; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <FileText className="h-4 w-4" /> },
  { value: 'getting-started', label: 'Getting Started', icon: <BookOpen className="h-4 w-4" /> },
  { value: 'agents', label: 'Agents', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'sessions', label: 'Sessions', icon: <HelpCircle className="h-4 w-4" /> },
  { value: 'webhooks', label: 'Webhooks', icon: <Code className="h-4 w-4" /> },
  { value: 'api', label: 'API', icon: <Code className="h-4 w-4" /> },
  { value: 'billing', label: 'Billing', icon: <FileText className="h-4 w-4" /> },
  { value: 'troubleshooting', label: 'Troubleshooting', icon: <HelpCircle className="h-4 w-4" /> },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  const { mutate: trackInteraction } = useTrackInteraction();
  const sessionId = getHelpCenterSessionId();

  // Track page view on mount
  useEffect(() => {
    trackInteraction({
      session_id: sessionId,
      interaction_type: 'page_view',
      section: 'help-center',
    });
  }, [trackInteraction, sessionId]);

  const { data: faqs, isLoading: faqsLoading } = useFAQs(
    selectedCategory === 'all' ? undefined : selectedCategory
  );
  const { data: searchResults, isLoading: searchLoading } = useSearchFAQs(searchQuery);

  const displayFAQs = searchQuery.trim().length > 0 ? searchResults : faqs;
  const isLoading = searchQuery.trim().length > 0 ? searchLoading : faqsLoading;

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    trackInteraction({
      session_id: sessionId,
      interaction_type: 'section_view',
      section: value,
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      trackInteraction({
        session_id: sessionId,
        interaction_type: 'search',
        search_query: query,
        section: 'faq',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="space-y-4">
            <h1 className="text-h1 text-foreground">Help Center</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Find answers to common questions, learn how to get started, explore our API documentation, and get support when you need it.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="getting-started" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Getting Started</span>
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">FAQ</span>
            </TabsTrigger>
            <TabsTrigger value="developer" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Developer Docs</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Contact</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Getting Started</CardTitle>
                  </div>
                  <CardDescription>
                    New to AgentForms? Follow our step-by-step guide to create your first conversational agent.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('getting-started')}
                    className="w-full"
                  >
                    View Guide
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <HelpCircle className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </div>
                  <CardDescription>
                    Browse our FAQ section to find quick answers to common questions about agents, sessions, webhooks, and more.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('faq')}
                    className="w-full"
                  >
                    Browse FAQs
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Code className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Developer Documentation</CardTitle>
                  </div>
                  <CardDescription>
                    Integrate AgentForms with your application using our webhook API and developer resources.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('developer')}
                    className="w-full"
                  >
                    View Docs
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Contact Support</CardTitle>
                  </div>
                  <CardDescription>
                    Can't find what you're looking for? Submit a support request and our team will get back to you.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('contact')}
                    className="w-full"
                  >
                    Get Support
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>What is AgentForms?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  AgentForms is a conversational AI agent form builder that lets you create public, shareable chat-based agents to collect structured data. Instead of traditional forms, your visitors interact with an AI agent that asks questions naturally, validates responses, and extracts structured data.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Create Agents</h4>
                    <p className="text-sm text-muted-foreground">
                      Define fields, validation rules, and persona to create conversational forms
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Collect Data</h4>
                    <p className="text-sm text-muted-foreground">
                      Visitors interact with your agent through natural conversation
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Integrate</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive data via webhooks or export sessions in JSON/CSV format
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="animate-in fade-in slide-in-from-top-2 duration-300">
            <GettingStartedSteps />
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Category Filters */}
              {searchQuery.trim().length === 0 && (
                <div className="flex flex-wrap gap-2">
                  {FAQ_CATEGORIES.map((category) => (
                    <Button
                      key={category.value}
                      variant={selectedCategory === category.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory(category.value)}
                      className="flex items-center gap-2"
                    >
                      {category.icon}
                      {category.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* FAQ List */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {searchQuery.trim().length > 0
                      ? `Search Results (${displayFAQs?.length || 0})`
                      : selectedCategory === 'all'
                      ? 'All FAQs'
                      : `${FAQ_CATEGORIES.find((c) => c.value === selectedCategory)?.label} FAQs`}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : displayFAQs && displayFAQs.length > 0 ? (
                    displayFAQs.map((faq) => (
                      <FAQItem key={faq.id} faq={faq} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchQuery.trim().length > 0
                          ? 'No FAQs found matching your search.'
                          : 'No FAQs available in this category.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Developer Docs Tab */}
          <TabsContent value="developer" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Developer Documentation</h2>
                <p className="text-muted-foreground">
                  Integrate AgentForms with your application using webhooks and our API
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Webhook Integration</CardTitle>
                    <CardDescription>
                      Receive real-time notifications when sessions are completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Webhook Payload Schema</h4>
                      <pre className="bg-surface p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{`{
  "event": "session.completed",
  "session_id": "uuid",
  "agent_id": "uuid",
  "extracted_fields": {
    "field_name": "value"
  },
  "transcript": [...],
  "completed_at": "ISO timestamp"
}`}</code>
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Webhooks are signed with HMAC SHA256. Verify signatures using the secret you configure.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Endpoints</CardTitle>
                    <CardDescription>
                      Access your agents and sessions programmatically
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Base URL</h4>
                      <code className="block bg-surface p-2 rounded text-sm">
                        https://api.agentforms.com/v1
                      </code>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Include your API key in the Authorization header:
                      </p>
                      <code className="block bg-surface p-2 rounded text-sm">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Rate Limits</CardTitle>
                    <CardDescription>
                      API usage limits and best practices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Free Plan</span>
                        <Badge variant="outline">100 req/hour</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Pro Plan</span>
                        <Badge variant="outline">1000 req/hour</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Enterprise</span>
                        <Badge variant="outline">Unlimited</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Code Samples</CardTitle>
                    <CardDescription>
                      Example integrations in popular languages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">JavaScript/TypeScript</h4>
                      <pre className="bg-surface p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{`const response = await fetch(
  'https://api.agentforms.com/v1/sessions',
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
    },
  }
);
const sessions = await response.json();`}</code>
                      </pre>
                    </div>
                    <Button variant="outline" className="w-full">
                      View All Code Samples
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Contact Support</h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and our support team will get back to you as soon as possible. 
                    We typically respond within 24 hours.
                  </p>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Support Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">Response Times</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Normal: 24-48 hours</li>
                        <li>• High: 12-24 hours</li>
                        <li>• Urgent: 4-8 hours</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground">What to Include</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Detailed description of your issue</li>
                        <li>• Steps to reproduce (if applicable)</li>
                        <li>• Screenshots or error messages</li>
                        <li>• Your agent ID or session ID (if relevant)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Request</CardTitle>
                  <CardDescription>
                    We'll send a confirmation email and respond to your request
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SupportForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
