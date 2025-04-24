// components/pages/PrincipalContent.tsx
import GaugeCard from "@/components/ui/GaugeCard";
import { Thermometer, Lightbulb } from "lucide-react";
import { useEffect, useState } from "react";
import { ref, get, child } from "firebase/database";
import { db } from "@/firebaseConfig"; // Asegúrate de que `db` sea la instancia de Realtime Database

export default function PrincipalContent() {
  const [tempData, setTempData] = useState<{ time: string; value: number }[]>([]);
  const [humidityData, setHumidityData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(db); // Use the Database instance directly

        // Obtén los datos de temperatura
        const tempSnapshot = await get(child(dbRef, "temperature"));
        const tempArray = tempSnapshot.exists()
          ? Object.values(tempSnapshot.val()).map((item: any) => ({
              time: item.time,
              value: item.value,
            }))
          : [];

        // Obtén los datos de humedad
        const humiditySnapshot = await get(child(dbRef, "humidity"));
        const humidityArray = humiditySnapshot.exists()
          ? Object.values(humiditySnapshot.val()).map((item: any) => ({
              time: item.time,
              value: item.value,
            }))
          : [];

        setTempData(tempArray);
        setHumidityData(humidityArray);
      } catch (error) {
        console.error("Error fetching data from Realtime Database:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-400 text-white rounded-xl p-6 md:col-span-1 flex flex-col justify-center">
          <h2 className="text-xl font-bold">DANE NOLASCO</h2>
          <p className="text-sm">Bienvenido a tu Dashboard Principal</p>
          <div className="flex items-center mt-4 space-x-2 text-lg">
            <span>Weather</span>
            <span className="font-bold text-2xl">{tempData[0]?.value || "N/A"}</span>
          </div>
        </div>
        <GaugeCard
          label="Temperature"
          value={tempData[0]?.value || 0}
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