import {
  Home,
  Monitor,
  BarChart2,
  UserCircle,
  LineChart,
} from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";

const getTabs = (t: any) => [
  { icon: <Home className="w-5 h-5" />, label: "PRINCIPAL", title: t.principal },
  { icon: <Monitor className="w-5 h-5" />, label: "DEVICES", title: t.devices },
  { icon: <BarChart2 className="w-5 h-5" />, label: "STATISTICS", title: t.statistics },
  { icon: <UserCircle className="w-5 h-5" />, label: "PROFILE", title: t.profile },
];

type Props = {
  activeTab: string;
  onTabChange: (label: string) => void;
};

export default function Sidebar({ activeTab, onTabChange }: Props) {
  const { language } = useAppContext();
  const t = translations[language];
  const tabs = getTabs(t);

  return (
    <aside className="w-16 bg-background border-r border-border flex flex-col items-center py-4">
      <div className="flex-1 flex flex-col items-center">
        <LineChart className="w-6 h-6 mb-8 text-primary" />
        <nav className="space-y-4">
          {tabs.map(({ icon, label, title }) => (
            <button
              key={label}
              onClick={() => onTabChange(label)}
              className={`flex items-center justify-center w-10 h-10 rounded-md transition-colors ${
                activeTab === label
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/5"
              }`}
              title={title}
            >
              {icon}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
  