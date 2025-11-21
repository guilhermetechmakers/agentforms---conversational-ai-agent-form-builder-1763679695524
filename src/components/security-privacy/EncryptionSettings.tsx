import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEncryptionStatus } from "@/hooks/useSecurityPrivacy";
import { Shield, Lock, Key, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function EncryptionSettings() {
  const { data: encryptionStatus, isLoading } = useEncryptionStatus();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = encryptionStatus || {
    field_level_encryption_enabled: false,
    encrypted_fields_count: 0,
    last_key_rotation: null,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Encryption Status
              </CardTitle>
              <CardDescription className="mt-2">
                Overview of data encryption and security measures
              </CardDescription>
            </div>
            <Badge
              variant={status.field_level_encryption_enabled ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {status.field_level_encryption_enabled ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Enabled
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Disabled
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Encryption Status Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Field Encryption</p>
                    <p className="text-lg font-semibold">
                      {status.field_level_encryption_enabled ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Key className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Encrypted Fields</p>
                    <p className="text-lg font-semibold">{status.encrypted_fields_count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <RefreshCw className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Key Rotation</p>
                    <p className="text-lg font-semibold">
                      {status.last_key_rotation
                        ? formatDistanceToNow(new Date(status.last_key_rotation), {
                            addSuffix: true,
                          })
                        : "Never"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Encryption Details */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-2">Data in Transit</h4>
              <p className="text-sm text-muted-foreground">
                All data transmitted between your browser and our servers is encrypted using TLS 1.3.
              </p>
              <Badge variant="outline" className="mt-2">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                TLS 1.3 Enabled
              </Badge>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 border">
              <h4 className="font-semibold mb-2">Data at Rest</h4>
              <p className="text-sm text-muted-foreground">
                {status.field_level_encryption_enabled
                  ? "Sensitive fields are encrypted at rest using AES-256 encryption."
                  : "Field-level encryption is currently disabled. Enable it to encrypt sensitive data at rest."}
              </p>
            </div>

            {!status.field_level_encryption_enabled && (
              <Button className="w-full sm:w-auto">
                <Lock className="h-4 w-4 mr-2" />
                Enable Field-Level Encryption
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
