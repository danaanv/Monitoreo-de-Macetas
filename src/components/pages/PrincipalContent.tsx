// components/pages/PrincipalContent.tsx
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";
import GaugeCard from "@/components/ui/GaugeCard";
import { Thermometer, Droplet } from "lucide-react";
import { useEffect, useState } from "react";
import { ref, onValue, query, limitToLast, off } from "firebase/database";
import { db } from "@/firebaseConfig";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";
import { useTheme } from "next-themes";

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

interface SensorDataPoint {
  time: number;
  value: number;
}

interface SensorData {
  [sensorId: string]: {
    temperature: SensorDataPoint[];
    humidity: SensorDataPoint[];
  };
}

export default function PrincipalContent() {
  const { language } = useAppContext();
  const { theme } = useTheme();
  const t = translations[language];
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [activeSensor, setActiveSensor] = useState<string | null>(null);
  const isDarkMode = theme === "dark";

  // Format time to Peru local time
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

  // Set initial active sensor
  useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const initialSensorListener = onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists() && !activeSensor) {
        const firstSensor = Object.keys(snapshot.val())[0];
        setActiveSensor(firstSensor);
      }
    });

    return () => {
      off(sensorsRef, 'value', initialSensorListener);
    };
  }, []); // Solo se ejecuta una vez al montar el componente

  // Listen for sensor data updates
  useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const sensorsListener = onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const sensors = snapshot.val();
        const updatedSensorData: SensorData = {};

        Object.keys(sensors).forEach((sensorId) => {
          // Get temperature data
          const tempQuery = query(ref(db, `sensors/${sensorId}/temperature`), limitToLast(15));
          const tempListener = onValue(tempQuery, (tempSnapshot) => {
            const temperature = tempSnapshot.exists()
              ? Object.values(tempSnapshot.val()).map((item: any) => ({
                  time: Number(item.time),
                  value: item.value,
                }))
              : [];

            // Get humidity data
            const humQuery = query(ref(db, `sensors/${sensorId}/humidity`), limitToLast(15));
            const humListener = onValue(humQuery, (humSnapshot) => {
              const humidity = humSnapshot.exists()
                ? Object.values(humSnapshot.val()).map((item: any) => ({
                    time: Number(item.time),
                    value: item.value,
                  }))
                : [];

              updatedSensorData[sensorId] = {
                temperature: temperature.sort((a, b) => a.time - b.time),
                humidity: humidity.sort((a, b) => a.time - b.time),
              };

              setSensorData((prev) => ({
                ...prev,
                [sensorId]: updatedSensorData[sensorId],
              }));
            });

            return () => {
              off(humQuery, 'value', humListener);
            };
          });

          return () => {
            off(tempQuery, 'value', tempListener);
          };
        });
      } else {
        setSensorData({});
      }
    });

    return () => {
      off(sensorsRef, 'value', sensorsListener);
    };
  }, []); // No incluimos activeSensor en las dependencias

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: true,
          color: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          tickColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? "rgba(27, 14, 14, 0.8)" : "rgba(7, 4, 4, 0.7)",
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          display: true,
          color: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          tickColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
          drawBorder: false
        },
        ticks: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
          font: {
            size: 11
          }
        }
      }
    },    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)",
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.8)",
        titleColor: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
        bodyColor: isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
        borderColor: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
        padding: 12,
        cornerRadius: 4
      }
    }
  };

  const temperatureOptions = {
    ...chartOptions
  };

  const humidityOptions = {
    ...chartOptions
  };

  // Get current sensor data
  const currentSensorData = activeSensor ? sensorData[activeSensor] : null;
  const lastTemp = currentSensorData?.temperature?.[currentSensorData.temperature.length - 1]?.value ?? 0;
  const lastHumidity = currentSensorData?.humidity?.[currentSensorData.humidity.length - 1]?.value ?? 0;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t.welcomeMessage}</h1>
      
      {/* Sensor tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {Object.keys(sensorData).map((sensorId) => (
          <button
            key={sensorId}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              activeSensor === sensorId 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => setActiveSensor(sensorId)}
          >
            {t.activeDevices} Sensor {sensorId.match(/\d+/)?.[0]}
          </button>
        ))}
      </div>

      {/* Active sensor content */}
      {currentSensorData && (
        <div>
          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <GaugeCard
              label={t.temperature}
              value={lastTemp}
              unit="°C"
              icon={<Thermometer className="w-5 h-5 text-primary" />}
              color="stroke-primary"
            />
            <GaugeCard
              label={t.humidity}
              value={lastHumidity}
              unit="%"
              icon={<Droplet className="w-5 h-5 text-info" />}
              color="stroke-info"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Temperature Chart */}
            <div className="bg-card text-card-foreground rounded-xl shadow p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-primary mb-4">{t.temperatureChart}</h3>
              <div className="h-[400px] w-full">
                <Line
                  data={{
                    labels: currentSensorData.temperature.map((item) => formatTime(item.time)),
                    datasets: [{                      label: `${t.temperature} (°C)`,
                      data: currentSensorData.temperature.map((item) => item.value),
                      borderColor: "#22c55e",
                      backgroundColor: "#22c55e20",
                      borderWidth: 2,
                      tension: 0.4,
                      pointBackgroundColor: "#22c55e",
                      pointBorderColor: "#22c55e",
                    }],
                  }}
                  options={temperatureOptions}
                />
              </div>
            </div>

            {/* Humidity Chart */}
            <div className="bg-card text-card-foreground rounded-xl shadow p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-info mb-4">{t.humidityChart}</h3>
              <div className="h-[400px] w-full">
                <Line
                  data={{
                    labels: currentSensorData.humidity.map((item) => formatTime(item.time)),
                    datasets: [{                      label: `${t.humidity} (%)`,
                      data: currentSensorData.humidity.map((item) => item.value),
                      borderColor: "#3b82f6",
                      backgroundColor: "#3b82f620",
                      borderWidth: 2,
                      tension: 0.4,
                      pointBackgroundColor: "#3b82f6",
                      pointBorderColor: "#3b82f6",
                    }],
                  }}
                  options={humidityOptions}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}