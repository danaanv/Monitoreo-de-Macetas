// components/pages/StatisticsContent.tsx
import GaugeCard from "@/components/ui/GaugeCard";
import { Thermometer, Lightbulb } from "lucide-react";

export default function StatisticsContent() {
  return (
    <>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-400 text-white rounded-xl p-6 md:col-span-1 flex flex-col justify-center">
          <h2 className="text-xl font-bold">JOHN</h2>
          <p className="text-sm">Welcome home</p>
          <div className="flex items-center mt-4 space-x-2 text-lg">
            <span>🌡️ Weather</span>
            <span className="font-bold text-2xl">23°C</span>
            <span>Sunny day</span>
          </div>
        </div>
        <GaugeCard
          label="Temperature"
          value={26}
          unit="°C"
          icon={<Thermometer className="w-5 h-5 text-green-600" />}
          color="stroke-green-500"
        />
        <GaugeCard
          label="Lights intensity"
          value={78}
          unit="%"
          icon={<Lightbulb className="w-5 h-5 text-emerald-500" />}
          color="stroke-emerald-400"
        />
      </div>
    </>
  );
}
