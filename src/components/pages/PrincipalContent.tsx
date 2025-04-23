// components/pages/PrincipalContent.tsx
import GaugeCard from "@/components/ui/GaugeCard";
import { Thermometer, Lightbulb } from "lucide-react";

export default function PrincipalContent() {
  const tempData = [
    { time: "08:00", value: "23°C" },
    { time: "09:00", value: "24°C" },
    { time: "10:00", value: "25°C" },
    { time: "11:00", value: "26°C" },
    { time: "12:00", value: "27°C" },
    { time: "13:00", value: "28°C" },
    { time: "14:00", value: "29°C" },
    { time: "15:00", value: "30°C" },
    { time: "16:00", value: "29°C" },
    { time: "17:00", value: "28°C" },
  ];

  const humidityData = [
    { time: "08:00", value: "65%" },
    { time: "09:00", value: "63%" },
    { time: "10:00", value: "61%" },
    { time: "11:00", value: "60%" },
    { time: "12:00", value: "58%" },
    { time: "13:00", value: "56%" },
    { time: "14:00", value: "55%" },
    { time: "15:00", value: "54%" },
    { time: "16:00", value: "56%" },
    { time: "17:00", value: "58%" },
  ];  
  
  return (
        <>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-400 text-white rounded-xl p-6 md:col-span-1 flex flex-col justify-center">
              <h2 className="text-xl font-bold">DANA NOLASCO</h2>
              <p className="text-sm">Bienvenido a tu Dashboard Principal</p>
              <div className="flex items-center mt-4 space-x-2 text-lg">
                <span>Weather</span>
                <span className="font-bold text-2xl">23°C</span>
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
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tabla de Temperatura */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-green-600 mb-4">Temperatura (últimas 10 lecturas)</h2>
        <table className="w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="pb-2">Hora</th>
              <th className="pb-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {tempData.map((item, idx) => (
              <tr key={idx} className="border-b last:border-none">
                <td className="py-2">{item.time}</td>
                <td className="py-2">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tabla de Humedad */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-green-600 mb-4">Humedad (últimas 10 lecturas)</h2>
        <table className="w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="pb-2">Hora</th>
              <th className="pb-2">Valor</th>
            </tr>
          </thead>
          <tbody>
            {humidityData.map((item, idx) => (
              <tr key={idx} className="border-b last:border-none">
                <td className="py-2">{item.time}</td>
                <td className="py-2">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
        </>
        
      );
    
  }
  