import { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Download, ArrowLeft, Shield, Scale, Cookie } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: 'privacy', title: 'Privacy Policy', icon: <Shield className="h-5 w-5" /> },
  { id: 'terms', title: 'Terms of Service', icon: <Scale className="h-5 w-5" /> },
  { id: 'cookies', title: 'Cookie Policy', icon: <Cookie className="h-5 w-5" /> },
];

export default function PrivacyTerms() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('privacy');
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  // Handle hash navigation on mount and when location changes
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && SECTIONS.some(s => s.id === hash)) {
      setTimeout(() => {
        scrollToSection(hash);
        setActiveSection(hash);
      }, 100);
    }
  }, [location]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Offset for header

      for (const section of SECTIONS) {
        const element = sectionRefs.current[section.id];
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      // Fallback: try to find element by ID
      const fallbackElement = document.getElementById(sectionId);
      if (fallbackElement) {
        const headerOffset = 100;
        const elementPosition = fallbackElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  const handleDownloadPDF = () => {
    // In a real implementation, this would download a PDF file
    // For now, we'll create a simple text-based PDF or link to a static file
    const content = document.getElementById('privacy-terms-content');
    if (content) {
      // This is a placeholder - in production, you'd use a library like jsPDF
      // or serve a pre-generated PDF from your server
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-40 shadow-soft">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="hidden sm:inline">Back to Home</span>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <h1 className="text-h1 text-foreground">Privacy & Terms</h1>
              </div>
            </div>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {SECTIONS.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                        'hover:bg-surface hover:scale-[1.02]',
                        activeSection === section.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {section.icon}
                      <span>{section.title}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-9" id="privacy-terms-content">
            <div className="space-y-12">
              {/* Privacy Policy Section */}
              <section
                ref={(el) => {
                  sectionRefs.current.privacy = el;
                }}
                id="privacy"
                className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-h2 text-foreground">Privacy Policy</h2>
                </div>
                <Card>
                  <CardContent className="p-8 prose prose-slate max-w-none">
                    <p className="text-muted-foreground mb-4">
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>

                    <div className="space-y-6 text-foreground">
                      <div>
                        <h3 className="text-h3 mb-3">1. Introduction</h3>
                        <p className="text-muted-foreground">
                          AgentForms ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our conversational AI agent form builder service. Please read this policy carefully to understand our practices regarding your data.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">2. Information We Collect</h3>
                        <h4 className="text-h4 mb-2">2.1 Account Information</h4>
                        <p className="text-muted-foreground mb-3">
                          When you create an account, we collect:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Name and email address</li>
                          <li>Company name (optional)</li>
                          <li>Password (hashed and encrypted)</li>
                          <li>Billing information for paid plans</li>
                        </ul>

                        <h4 className="text-h4 mb-2">2.2 Agent and Session Data</h4>
                        <p className="text-muted-foreground mb-3">
                          We store the following data related to your agents and sessions:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Agent configurations (schema, persona, knowledge base)</li>
                          <li>Session transcripts and messages</li>
                          <li>Extracted structured data from conversations</li>
                          <li>Visitor metadata (IP address, user agent, timestamps)</li>
                        </ul>

                        <h4 className="text-h4 mb-2">2.3 Usage and Analytics</h4>
                        <p className="text-muted-foreground">
                          We collect usage statistics including session counts, completion rates, and feature usage to improve our service and provide analytics dashboards.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">3. How We Use Your Information</h3>
                        <p className="text-muted-foreground mb-3">
                          We use the collected information for the following purposes:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>To provide, maintain, and improve our services</li>
                          <li>To process transactions and manage subscriptions</li>
                          <li>To send transactional emails (verification, password reset, notifications)</li>
                          <li>To deliver webhook notifications as configured</li>
                          <li>To analyze usage patterns and improve user experience</li>
                          <li>To detect and prevent fraud or abuse</li>
                          <li>To comply with legal obligations</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">4. Data Storage and Security</h3>
                        <p className="text-muted-foreground mb-3">
                          We implement industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>All data is encrypted in transit using TLS/SSL</li>
                          <li>Passwords are hashed using bcrypt with salt</li>
                          <li>PII (Personally Identifiable Information) fields can be encrypted at rest</li>
                          <li>Access controls and Row-Level Security (RLS) policies</li>
                          <li>Regular security audits and monitoring</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                          Data is stored in secure cloud infrastructure with redundant backups. While we take reasonable precautions, no method of transmission over the internet is 100% secure.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">5. Data Retention</h3>
                        <p className="text-muted-foreground mb-3">
                          We retain your data for as long as necessary to provide our services and comply with legal obligations:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Account data: Retained while your account is active, deleted within 30 days of account closure</li>
                          <li>Session data: Retained according to your configured retention policy (default: 90 days)</li>
                          <li>Billing records: Retained for 7 years as required by tax law</li>
                          <li>Audit logs: Retained for 1 year for security and compliance</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                          You can configure retention policies per agent or request data deletion at any time through your account settings.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">6. Data Sharing and Disclosure</h3>
                        <p className="text-muted-foreground mb-3">
                          We do not sell your data. We may share information in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li><strong>Service Providers:</strong> With trusted third-party services (hosting, payment processing, email delivery) under strict confidentiality agreements</li>
                          <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets (with notice to users)</li>
                          <li><strong>With Your Consent:</strong> When you explicitly authorize sharing, such as configuring webhooks</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">7. Your Rights and Choices</h3>
                        <p className="text-muted-foreground mb-3">
                          Depending on your location, you may have the following rights:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li><strong>Access:</strong> Request a copy of your personal data</li>
                          <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                          <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                          <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                          <li><strong>Opt-out:</strong> Unsubscribe from marketing emails (transactional emails cannot be opted out)</li>
                          <li><strong>Objection:</strong> Object to certain processing activities</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                          To exercise these rights, contact us at privacy@agentforms.com or through your account settings.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">8. International Data Transfers</h3>
                        <p className="text-muted-foreground">
                          Your data may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place, including Standard Contractual Clauses (SCCs) and compliance with applicable data protection laws such as GDPR.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">9. Children's Privacy</h3>
                        <p className="text-muted-foreground">
                          Our service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">10. Changes to This Policy</h3>
                        <p className="text-muted-foreground">
                          We may update this Privacy Policy from time to time. We will notify you of material changes by email or through a prominent notice on our website. Your continued use of the service after changes become effective constitutes acceptance of the updated policy.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">11. Contact Us</h3>
                        <p className="text-muted-foreground">
                          If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                        </p>
                        <ul className="list-none space-y-1 text-muted-foreground mt-3">
                          <li><strong>Email:</strong> privacy@agentforms.com</li>
                          <li><strong>Address:</strong> [Your Company Address]</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Terms of Service Section */}
              <section
                ref={(el) => {
                  sectionRefs.current.terms = el;
                }}
                id="terms"
                className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-h2 text-foreground">Terms of Service</h2>
                </div>
                <Card>
                  <CardContent className="p-8 prose prose-slate max-w-none">
                    <p className="text-muted-foreground mb-4">
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>

                    <div className="space-y-6 text-foreground">
                      <div>
                        <h3 className="text-h3 mb-3">1. Acceptance of Terms</h3>
                        <p className="text-muted-foreground">
                          By accessing or using AgentForms ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service. These Terms apply to all users, including visitors, registered users, and organizations.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">2. Description of Service</h3>
                        <p className="text-muted-foreground">
                          AgentForms is a conversational AI agent form builder platform that enables users to create, publish, and manage chat-based agents for collecting structured data. The Service includes agent creation tools, session management, data export capabilities, webhook integrations, and analytics dashboards.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">3. User Accounts</h3>
                        <h4 className="text-h4 mb-2">3.1 Account Creation</h4>
                        <p className="text-muted-foreground mb-3">
                          To use certain features, you must create an account. You agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Provide accurate, current, and complete information</li>
                          <li>Maintain and update your information to keep it accurate</li>
                          <li>Maintain the security of your password</li>
                          <li>Accept responsibility for all activities under your account</li>
                          <li>Notify us immediately of any unauthorized access</li>
                        </ul>

                        <h4 className="text-h4 mb-2">3.2 Account Eligibility</h4>
                        <p className="text-muted-foreground">
                          You must be at least 18 years old and have the legal capacity to enter into contracts. Organizations must be properly authorized to use the Service on behalf of the entity.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">4. Acceptable Use</h3>
                        <h4 className="text-h4 mb-2">4.1 Permitted Uses</h4>
                        <p className="text-muted-foreground mb-3">
                          You may use the Service for lawful business purposes, including:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Creating conversational agents for data collection</li>
                          <li>Managing sessions and analyzing responses</li>
                          <li>Integrating with your applications via webhooks</li>
                          <li>Exporting and using collected data for your business needs</li>
                        </ul>

                        <h4 className="text-h4 mb-2">4.2 Prohibited Uses</h4>
                        <p className="text-muted-foreground mb-3">
                          You agree NOT to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Use the Service for illegal activities or to violate any laws</li>
                          <li>Collect sensitive data (e.g., credit card numbers, SSN) without proper security measures</li>
                          <li>Create agents that impersonate others or mislead users</li>
                          <li>Spam, harass, or abuse visitors through agents</li>
                          <li>Attempt to reverse engineer, decompile, or extract source code</li>
                          <li>Interfere with or disrupt the Service or servers</li>
                          <li>Use automated tools to abuse rate limits or bypass security</li>
                          <li>Share account credentials or allow unauthorized access</li>
                          <li>Violate any third-party rights (intellectual property, privacy, etc.)</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">5. Content and Intellectual Property</h3>
                        <h4 className="text-h4 mb-2">5.1 Your Content</h4>
                        <p className="text-muted-foreground mb-3">
                          You retain ownership of all content you create, upload, or submit through the Service (agents, knowledge bases, session data). By using the Service, you grant us a limited, non-exclusive license to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Store, process, and display your content to provide the Service</li>
                          <li>Use aggregated, anonymized data for analytics and service improvement</li>
                        </ul>

                        <h4 className="text-h4 mb-2">5.2 Our Intellectual Property</h4>
                        <p className="text-muted-foreground">
                          The Service, including software, design, logos, and documentation, is owned by AgentForms and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, or create derivative works without our written permission.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">6. Subscriptions and Billing</h3>
                        <h4 className="text-h4 mb-2">6.1 Subscription Plans</h4>
                        <p className="text-muted-foreground mb-3">
                          The Service is offered on a subscription basis with different tiers (Free, Pro, Enterprise). Features, limits, and pricing are subject to change with notice.
                        </p>

                        <h4 className="text-h4 mb-2">6.2 Payment Terms</h4>
                        <p className="text-muted-foreground mb-3">
                          By subscribing, you agree to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Pay all fees associated with your plan</li>
                          <li>Provide accurate billing information</li>
                          <li>Authorize automatic recurring charges (monthly/yearly)</li>
                          <li>Pay any applicable taxes</li>
                        </ul>

                        <h4 className="text-h4 mb-2">6.3 Cancellation and Refunds</h4>
                        <p className="text-muted-foreground">
                          You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. Refunds are provided at our discretion and in accordance with applicable laws. No refunds for partial billing periods unless required by law.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">7. Data and Privacy</h3>
                        <p className="text-muted-foreground">
                          Your use of the Service is also governed by our Privacy Policy. You are responsible for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Complying with applicable data protection laws (GDPR, CCPA, etc.)</li>
                          <li>Obtaining necessary consents from visitors before collecting data</li>
                          <li>Securing data transmitted through webhooks</li>
                          <li>Properly handling and protecting collected data</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">8. Service Availability and Modifications</h3>
                        <p className="text-muted-foreground mb-3">
                          We strive to maintain high availability but do not guarantee uninterrupted service. We may:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Perform scheduled maintenance with advance notice</li>
                          <li>Modify, suspend, or discontinue features with reasonable notice</li>
                          <li>Update the Service to improve functionality or security</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                          We are not liable for any downtime, data loss, or service interruptions.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">9. Limitation of Liability</h3>
                        <p className="text-muted-foreground mb-3">
                          TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind</li>
                          <li>We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose</li>
                          <li>We are not liable for indirect, incidental, special, or consequential damages</li>
                          <li>Our total liability is limited to the amount you paid in the 12 months preceding the claim</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">10. Indemnification</h3>
                        <p className="text-muted-foreground">
                          You agree to indemnify and hold harmless AgentForms, its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">11. Termination</h3>
                        <h4 className="text-h4 mb-2">11.1 Termination by You</h4>
                        <p className="text-muted-foreground mb-4">
                          You may terminate your account at any time through account settings or by contacting support.
                        </p>

                        <h4 className="text-h4 mb-2">11.2 Termination by Us</h4>
                        <p className="text-muted-foreground mb-3">
                          We may suspend or terminate your account if you:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Violate these Terms or our Acceptable Use Policy</li>
                          <li>Engage in fraudulent or illegal activities</li>
                          <li>Fail to pay subscription fees</li>
                          <li>Pose a security risk to the Service or other users</li>
                        </ul>

                        <h4 className="text-h4 mb-2">11.3 Effect of Termination</h4>
                        <p className="text-muted-foreground">
                          Upon termination, your access to the Service will cease. We will retain your data according to our Privacy Policy and data retention policies. You may export your data before termination.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">12. Dispute Resolution</h3>
                        <p className="text-muted-foreground mb-3">
                          These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved through:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li>Good faith negotiation</li>
                          <li>Binding arbitration if negotiation fails (except where prohibited by law)</li>
                          <li>Class action waiver: You agree not to participate in class actions</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">13. Changes to Terms</h3>
                        <p className="text-muted-foreground">
                          We may modify these Terms at any time. Material changes will be notified via email or prominent website notice. Continued use after changes constitutes acceptance. If you disagree with changes, you must terminate your account.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">14. Contact Information</h3>
                        <p className="text-muted-foreground">
                          For questions about these Terms, contact us:
                        </p>
                        <ul className="list-none space-y-1 text-muted-foreground mt-3">
                          <li><strong>Email:</strong> legal@agentforms.com</li>
                          <li><strong>Address:</strong> [Your Company Address]</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Cookie Policy Section */}
              <section
                ref={(el) => {
                  sectionRefs.current.cookies = el;
                }}
                id="cookies"
                className="scroll-mt-24 animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Cookie className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-h2 text-foreground">Cookie Policy</h2>
                </div>
                <Card>
                  <CardContent className="p-8 prose prose-slate max-w-none">
                    <p className="text-muted-foreground mb-4">
                      <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>

                    <div className="space-y-6 text-foreground">
                      <div>
                        <h3 className="text-h3 mb-3">1. What Are Cookies?</h3>
                        <p className="text-muted-foreground">
                          Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, improve functionality, and provide analytics. AgentForms uses cookies to enhance your experience and provide essential features.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">2. Types of Cookies We Use</h3>
                        <h4 className="text-h4 mb-2">2.1 Essential Cookies</h4>
                        <p className="text-muted-foreground mb-3">
                          These cookies are necessary for the Service to function and cannot be disabled:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li><strong>Authentication:</strong> Maintain your login session</li>
                          <li><strong>Security:</strong> Protect against CSRF attacks and unauthorized access</li>
                          <li><strong>Session Management:</strong> Track active sessions and user preferences</li>
                        </ul>

                        <h4 className="text-h4 mb-2">2.2 Functional Cookies</h4>
                        <p className="text-muted-foreground mb-3">
                          These cookies enhance functionality and personalization:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li><strong>Preferences:</strong> Remember your language, theme, and UI settings</li>
                          <li><strong>Feature Flags:</strong> Enable or disable beta features based on your preferences</li>
                        </ul>

                        <h4 className="text-h4 mb-2">2.3 Analytics Cookies</h4>
                        <p className="text-muted-foreground mb-3">
                          These cookies help us understand how you use the Service (with your consent):
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li><strong>Usage Analytics:</strong> Track page views, feature usage, and user flows</li>
                          <li><strong>Performance Monitoring:</strong> Identify errors and optimize performance</li>
                          <li><strong>Aggregated Statistics:</strong> Understand overall service usage patterns</li>
                        </ul>
                        <p className="text-muted-foreground">
                          Analytics data is aggregated and anonymized. We do not use cookies to track you across other websites.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">3. Third-Party Cookies</h3>
                        <p className="text-muted-foreground mb-3">
                          We may use third-party services that set their own cookies:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li><strong>Payment Processors:</strong> Stripe uses cookies for secure payment processing</li>
                          <li><strong>Analytics Providers:</strong> Optional analytics services (if enabled) may set cookies</li>
                          <li><strong>Support Tools:</strong> Customer support chat widgets may use cookies</li>
                        </ul>
                        <p className="text-muted-foreground mt-4">
                          These third parties have their own privacy policies. We recommend reviewing their cookie policies.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">4. Cookie Duration</h3>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                          <li><strong>Session Cookies:</strong> Expire when you close your browser</li>
                          <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (typically 30-365 days) or until you delete them</li>
                          <li><strong>Authentication Cookies:</strong> Typically expire after 30 days of inactivity or when you log out</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">5. Managing Cookies</h3>
                        <h4 className="text-h4 mb-2">5.1 Browser Settings</h4>
                        <p className="text-muted-foreground mb-3">
                          You can control cookies through your browser settings:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                          <li>Block all cookies (may affect Service functionality)</li>
                          <li>Delete existing cookies</li>
                          <li>Set preferences for specific websites</li>
                          <li>Receive notifications when cookies are set</li>
                        </ul>
                        <p className="text-muted-foreground">
                          Note: Blocking essential cookies may prevent you from using certain features of the Service.
                        </p>

                        <h4 className="text-h4 mb-2">5.2 Cookie Consent</h4>
                        <p className="text-muted-foreground">
                          When you first visit AgentForms, you may see a cookie consent banner. You can accept, reject, or customize cookie preferences. You can change these preferences at any time through your account settings or by clearing your browser cookies.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">6. Do Not Track Signals</h3>
                        <p className="text-muted-foreground">
                          Some browsers send "Do Not Track" (DNT) signals. Currently, we do not respond to DNT signals, but we respect your cookie preferences set through our consent mechanism. We do not use cookies for cross-site tracking or advertising purposes.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">7. Updates to This Policy</h3>
                        <p className="text-muted-foreground">
                          We may update this Cookie Policy to reflect changes in our practices or legal requirements. We will notify you of material changes through our website or email. Continued use of the Service after changes constitutes acceptance.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-h3 mb-3">8. Contact Us</h3>
                        <p className="text-muted-foreground">
                          If you have questions about our use of cookies, contact us:
                        </p>
                        <ul className="list-none space-y-1 text-muted-foreground mt-3">
                          <li><strong>Email:</strong> privacy@agentforms.com</li>
                          <li><strong>Address:</strong> [Your Company Address]</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Need help? Contact us at{' '}
                  <a href="mailto:support@agentforms.com" className="text-primary hover:underline">
                    support@agentforms.com
                  </a>
                </p>
                <div className="flex gap-4">
                  <Link to="/help">
                    <Button variant="outline">Help Center</Button>
                  </Link>
                  <Button onClick={handleDownloadPDF} variant="default" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
