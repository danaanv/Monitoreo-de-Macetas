// components/pages/PrincipalContent.tsx
import GaugeCard from "@/components/ui/GaugeCard";
import { Thermometer, Lightbulb, Droplet } from "lucide-react";
import { useEffect, useState } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "@/firebaseConfig"; // Asegúrate de que `db` sea la instancia de Realtime Database
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function PrincipalContent() {
  const [sensorData, setSensorData] = useState<{ [sensorId: string]: { temperature: any[]; humidity: any[] } }>({});
  const [activeSensor, setActiveSensor] = useState<string | null>(null); // Sensor activo para las pestañas

  // Función para convertir el timestamp a la hora local de Perú
  const formatTime = (timestamp: number) => {
    const peruTimezone = "America/Lima"; // Zona horaria de Perú
    const date = new Date(timestamp * 1000); // Convertir de segundos a milisegundos
    return new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Formato 24 horas
      timeZone: peruTimezone,
    }).format(date);
  };

  useEffect(() => {
    // Escuchar cambios en tiempo real para todos los sensores
    const sensorsRef = ref(db, "sensors");
    const sensorsListener = onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const sensors = snapshot.val();
        const updatedSensorData: { [sensorId: string]: { temperature: any[]; humidity: any[] } } = {};

        Object.keys(sensors).forEach((sensorId) => {
          // Query para obtener los últimos 15 registros de temperatura
          const tempQuery = query(ref(db, `sensors/${sensorId}/temperature`), limitToLast(15));
          onValue(tempQuery, (tempSnapshot) => {
            const temperature = tempSnapshot.exists()
              ? Object.values(tempSnapshot.val()).map((item: any) => ({
                  time: Number(item.time),
                  value: item.value,
                }))
              : [];

            // Query para obtener los últimos 15 registros de humedad
            const humQuery = query(ref(db, `sensors/${sensorId}/humidity`), limitToLast(15));
            onValue(humQuery, (humSnapshot) => {
              const humidity = humSnapshot.exists()
                ? Object.values(humSnapshot.val()).map((item: any) => ({
                    time: Number(item.time),
                    value: item.value,
                  }))
                : [];

              updatedSensorData[sensorId] = {
                temperature: temperature.sort((a, b) => a.time - b.time), // Ordenar por tiempo ascendente
                humidity: humidity.sort((a, b) => a.time - b.time), // Ordenar por tiempo ascendente
              };

              setSensorData((prev) => ({
                ...prev,
                [sensorId]: updatedSensorData[sensorId],
              }));

              // Establecer el primer sensor como activo por defecto
              if (!activeSensor) {
                setActiveSensor(sensorId);
              }
            });
          });
        });
      } else {
        setSensorData({});
      }
    });

    return () => {
      sensorsListener(); // Detener escucha de sensores
    };
  }, [activeSensor]);

  if (activeSensor && sensorData[activeSensor]) {
    const tempData = sensorData[activeSensor]?.temperature || [];
    const humidityData = sensorData[activeSensor]?.humidity || [];
  }

  return (
    <div className="p-6">
      {/* Pestañas para seleccionar sensores */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {Object.keys(sensorData).map((sensorId) => (
          <button
            key={sensorId}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeSensor === sensorId ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveSensor(sensorId)}
          >
            Sensor {sensorId}
          </button>
        ))}
      </div>

      {/* Contenido del sensor activo */}
      {activeSensor && sensorData[activeSensor] && (
        <div>
          {/* Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <GaugeCard
              label="Temperature"
              value={sensorData[activeSensor]?.temperature[sensorData[activeSensor]?.temperature.length - 1]?.value || 0}
              unit="°C"
              icon={<Thermometer className="w-5 h-5 text-green-600" />}
              color="stroke-green-500"
            />
            <GaugeCard
              label="Humidity"
              value={sensorData[activeSensor]?.humidity[sensorData[activeSensor]?.humidity.length - 1]?.value || 0}
              unit="%"
              icon={<Droplet className="w-5 h-5 text-blue-600" />}
              color="stroke-blue-500"
            />
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Gráfico de Temperatura</h3>
              <Line
                data={{
                  labels: sensorData[activeSensor]?.temperature.map((item) => formatTime(item.time)),
                  datasets: [
                    {
                      label: "Temperatura (°C)",
                      data: sensorData[activeSensor]?.temperature.map((item) => item.value),
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                      tension: 0.4,
                    },
                  ],
                }}
              />
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Gráfico de Humedad</h3>
              <Line
                data={{
                  labels: sensorData[activeSensor]?.humidity.map((item) => formatTime(item.time)),
                  datasets: [
                    {
                      label: "Humedad (%)",
                      data: sensorData[activeSensor]?.humidity.map((item) => item.value),
                      borderColor: "rgba(153, 102, 255, 1)",
                      backgroundColor: "rgba(153, 102, 255, 0.2)",
                      tension: 0.4,
                    },
                  ],
                }}
              />
            </div>
          </div>

          {/* Tablas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Temperatura (últimas 15 lecturas)</h3>
              <table className="w-full text-left text-sm text-gray-700">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Hora</th>
                    <th className="pb-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sensorData[activeSensor]?.temperature].reverse().map((item, idx) => (
                    <tr key={idx} className="border-b last:border-none">
                      <td className="py-2">{formatTime(item.time)}</td>
                      <td className="py-2">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Humedad (últimas 15 lecturas)</h3>
              <table className="w-full text-left text-sm text-gray-700">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2">Hora</th>
                    <th className="pb-2">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sensorData[activeSensor]?.humidity].reverse().map((item, idx) => (
                    <tr key={idx} className="border-b last:border-none">
                      <td className="py-2">{formatTime(item.time)}</td>
                      <td className="py-2">{item.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}