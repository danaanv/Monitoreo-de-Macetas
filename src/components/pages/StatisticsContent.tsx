import { useEffect, useState, useRef } from "react";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";

interface SensorData {
  time: number;
  value: number;
}

interface SensorStats {
  average: number;
  median: number;
  mode: number;
  min: number;
  max: number;
}

export default function StatisticsContent() {
  const { language } = useAppContext();
  const t = translations[language];
  const [sensorData, setSensorData] = useState<{ [sensorId: string]: { temperature: SensorData[]; humidity: SensorData[] } }>({});
  const [activeSensor, setActiveSensor] = useState<string | null>(null);
  const activeSensorRef = useRef<string | null>(null);

  // Función para convertir el timestamp a la hora local de Perú
  const formatTime = (timestamp: number) => {
    const peruTimezone = "America/Lima";
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: peruTimezone,
    }).format(date);
  };

  // Funciones para calcular estadísticas
  const calculateStats = (data: SensorData[]): SensorStats => {
    const values = data.map(item => item.value);
    
    // Promedio
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Mediana
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = values.length % 2 === 0
      ? (sortedValues[values.length / 2 - 1] + sortedValues[values.length / 2]) / 2
      : sortedValues[Math.floor(values.length / 2)];
    
    // Moda
    const frequency: { [key: number]: number } = {};
    values.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const mode = Number(Object.entries(frequency)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0]);

    return {
      average,
      median,
      mode,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  // Update ref when active sensor changes
  useEffect(() => {
    activeSensorRef.current = activeSensor;
  }, [activeSensor]);

  useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const sensorsListener = onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const sensors = snapshot.val();
        const updatedSensorData: { [sensorId: string]: { temperature: SensorData[]; humidity: SensorData[] } } = {};

        Object.keys(sensors).forEach((sensorId) => {
          const tempQuery = query(ref(db, `sensors/${sensorId}/temperature`), limitToLast(15));
          onValue(tempQuery, (tempSnapshot) => {
            const temperature = tempSnapshot.exists()
              ? Object.values(tempSnapshot.val()).map((item: any) => ({
                  time: Number(item.time),
                  value: item.value,
                }))
              : [];

            const humQuery = query(ref(db, `sensors/${sensorId}/humidity`), limitToLast(15));
            onValue(humQuery, (humSnapshot) => {
              const humidity = humSnapshot.exists()
                ? Object.values(humSnapshot.val()).map((item: any) => ({
                    time: Number(item.time),
                    value: item.value,
                  }))
                : [];

              setSensorData((prev) => ({
                ...prev,
                [sensorId]: {
                  temperature: temperature.sort((a, b) => a.time - b.time),
                  humidity: humidity.sort((a, b) => a.time - b.time),
                },
              }));

              // Solo establecer el sensor activo si no hay ninguno seleccionado
              if (activeSensorRef.current === null) {
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
      sensorsListener();
    };
  }, []); // Removida la dependencia de activeSensor

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t.statistics}</h1>
      {/* Selector de sensores */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {Object.keys(sensorData).map((sensorId) => (
          <button
            key={sensorId}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeSensor === sensorId ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => setActiveSensor(sensorId)}
          >
            {t.activeDevices} Sensor {sensorId.match(/\d+/)?.[0]}
          </button>
        ))}
      </div>

      {activeSensor && sensorData[activeSensor] && (
        <div className="space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estadísticas de Temperatura */}
            <div className="bg-card text-card-foreground rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">{t.temperatureChart}</h3>
              {(() => {
                const stats = calculateStats(sensorData[activeSensor].temperature);
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.average}</p>
                      <p className="text-lg font-semibold">{stats.average.toFixed(2)}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.median}</p>
                      <p className="text-lg font-semibold">{stats.median.toFixed(2)}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.mode}</p>
                      <p className="text-lg font-semibold">{stats.mode.toFixed(2)}°C</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.range}</p>
                      <p className="text-lg font-semibold">{stats.min.toFixed(2)}°C - {stats.max.toFixed(2)}°C</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Estadísticas de Humedad */}
            <div className="bg-card text-card-foreground rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">{t.humidityChart}</h3>
              {(() => {
                const stats = calculateStats(sensorData[activeSensor].humidity);
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t.average}</p>
                      <p className="text-lg font-semibold">{stats.average.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.median}</p>
                      <p className="text-lg font-semibold">{stats.median.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.mode}</p>
                      <p className="text-lg font-semibold">{stats.mode.toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{t.range}</p>
                      <p className="text-lg font-semibold">{stats.min.toFixed(2)}% - {stats.max.toFixed(2)}%</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Tablas de datos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card text-card-foreground rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">{t.temperatureReadings}</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-muted-foreground">{t.time}</th>
                    <th className="pb-2 text-muted-foreground">{t.value}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sensorData[activeSensor].temperature].reverse().map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-none hover:bg-muted">
                      <td className="py-2">{formatTime(item.time)}</td>
                      <td className="py-2">{item.value}°C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-card text-card-foreground rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">{t.humidityReadings}</h3>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-muted-foreground">{t.time}</th>
                    <th className="pb-2 text-muted-foreground">{t.value}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sensorData[activeSensor].humidity].reverse().map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-none hover:bg-muted">
                      <td className="py-2">{formatTime(item.time)}</td>
                      <td className="py-2">{item.value}%</td>
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
