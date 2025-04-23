// components/Sidebar.tsx

import {
    Home,
    Monitor,
    Lock,
    BarChart2,
    Video,
    Users,
    LineChart,
    Settings,
  } from "lucide-react";
  
  const tabs = [
    { icon: <Home className="w-5 h-5" />, label: "PRINCIPAL" },
    { icon: <Monitor className="w-5 h-5" />, label: "DEVICES" },
    { icon: <Lock className="w-5 h-5" />, label: "SECURITY" },
    { icon: <BarChart2 className="w-5 h-5" />, label: "STATISTICS" },
    { icon: <Video className="w-5 h-5" />, label: "SCENES" },
    { icon: <Users className="w-5 h-5" />, label: "MEMBERS" },
  ];
  
  type Props = {
    activeTab: string;
    onTabChange: (label: string) => void;
  };
  
  export default function Sidebar({ activeTab, onTabChange }: Props) {
    return (
      <aside className="w-16 bg-white text-gray-500 flex flex-col items-center py-4 space-y-6">
        <LineChart className="w-6 h-6 mb-4" />
        {tabs.map(({ icon, label }) => (
          <div
            key={label}
            onClick={() => onTabChange(label)}
            className={`cursor-pointer hover:text-gray-700 ${
              activeTab === label
                ? "text-black"
                : "text-gray-400"
            }`}
          >
            {icon}
          </div>
        ))}
        <Settings className="w-6 h-6 mt-auto text-green-200" />
      </aside>
    );  
  }
  