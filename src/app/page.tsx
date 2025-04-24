// app/dashboard/page.tsx

"use client";

import { useState } from "react";
import NavigationBar from "../components/ui/NavigationBar";
import Sidebar from "../components/ui/Sidebar";
import PrincipalContent from "@/components/pages/PrincipalContent";
import DevicesContent from "@/components/pages/DevicesContent";
import StatisticsContent from "@/components/pages/StatisticsContent";


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("PRINCIPAL");

  const renderContent = () => {
    switch (activeTab) {
      case "PRINCIPAL":
        return <PrincipalContent />;
      case "DISPOSITIVOS":
        return <DevicesContent />;
      case "ESTADISTICAS":
      default:
        return <StatisticsContent />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F0F5F0] font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <NavigationBar />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
