import { UserCircle, Mail, Shield } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { translations } from '@/lib/i18n';

export default function ProfileContent() {
  const { language } = useAppContext();
  const t = translations[language];

  const userProfile = {
    name: "Admin",
    role: "Administrator",
    email: "admin@example.com"
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-primary/10 rounded-full">
          <UserCircle className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{t.userProfile}</h2>
          <p className="text-muted-foreground">
            {t.profile}
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="flex items-center space-x-4">
          <UserCircle className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t.profile}</p>
            <p className="text-sm text-muted-foreground">{userProfile.name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t.role}</p>
            <p className="text-sm text-muted-foreground">{userProfile.role}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{t.email}</p>
            <p className="text-sm text-muted-foreground">{userProfile.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
