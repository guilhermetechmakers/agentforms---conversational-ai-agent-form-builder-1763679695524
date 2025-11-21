import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EncryptionSettings from "@/components/security-privacy/EncryptionSettings";
import RetentionPolicies from "@/components/security-privacy/RetentionPolicies";
import AuditLogsDashboard from "@/components/security-privacy/AuditLogsDashboard";
import AccessControls from "@/components/security-privacy/AccessControls";
import DSRManagement from "@/components/security-privacy/DSRManagement";
import { Shield, Lock, Calendar, FileText, Users, AlertCircle } from "lucide-react";

export default function SecurityPrivacySettings() {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Security & Privacy</h1>
          <p className="text-muted-foreground">
            Manage encryption, data retention, access controls, and privacy compliance
          </p>
        </div>

        <Tabs defaultValue="encryption" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-6">
            <TabsTrigger value="encryption" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Encryption</span>
            </TabsTrigger>
            <TabsTrigger value="retention" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Retention</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Audit Logs</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Access</span>
            </TabsTrigger>
            <TabsTrigger value="dsr" className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="hidden sm:inline">DSR</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="encryption" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Data Encryption
                </CardTitle>
                <CardDescription>
                  Configure encryption settings for data at rest and in transit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EncryptionSettings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="retention" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Data Retention Policies
                </CardTitle>
                <CardDescription>
                  Configure automatic data deletion policies for GDPR/CCPA compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RetentionPolicies />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Audit Logs
                </CardTitle>
                <CardDescription>
                  View comprehensive audit trail of security and privacy events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuditLogsDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Access Controls
                </CardTitle>
                <CardDescription>
                  Manage permissions for sessions, data exports, and sensitive operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessControls />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dsr" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  Data Subject Requests
                </CardTitle>
                <CardDescription>
                  Exercise your privacy rights under GDPR and CCPA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DSRManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
