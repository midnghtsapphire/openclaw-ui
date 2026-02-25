import DashboardLayout from "@/components/DashboardLayout";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import { useAuth } from "@/_core/hooks/useAuth";
import { Settings, User, Accessibility } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and accessibility preferences.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Profile */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{user?.name ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email ?? "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user?.role ?? "user"}</p>
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Accessibility className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold">Accessibility</h2>
            </div>
            <AccessibilityPanel />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
