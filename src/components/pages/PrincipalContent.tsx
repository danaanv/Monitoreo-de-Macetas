// components/pages/PrincipalContent.tsx
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";
import GaugeCard from "@/components/ui/GaugeCard";
import { Thermometer, Droplet } from "lucide-react";
import { useEffect, useState, useRef } from "react";
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

interface SensorTypeData {
  temperature: SensorDataPoint[];
  humidity: SensorDataPoint[];
}

interface SensorsDataType {
  [key: string]: SensorTypeData;
}

export default function PrincipalContent() {
  const { language } = useAppContext();
  const { theme } = useTheme();
  const t = translations[language];
  const [sensorIds, setSensorIds] = useState<string[]>([]);
  const [sensorsData, setSensorsData] = useState<SensorsDataType>({});
  const [activeSensor, setActiveSensor] = useState<string | null>(null);
  const activeSensorRef = useRef<string | null>(null); // Add this line
  const isDarkMode = theme === "dark";
  const sensorsRef = useRef(ref(db, "sensors"));

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

  // Update ref when active sensor changes
  useEffect(() => {
    activeSensorRef.current = activeSensor;
  }, [activeSensor]);

  // Listen for available sensors
  useEffect(() => {
    const listener = onValue(sensorsRef.current, (snapshot) => {
      if (snapshot.exists()) {
        const sensors = Object.keys(snapshot.val());
        setSensorIds(sensors);
        if (activeSensorRef.current === null && sensors.length > 0) {
          setActiveSensor(sensors[0]);
        }
      } else {
        setSensorIds([]);
      }
    });

    return () => off(sensorsRef.current, 'value', listener);
  }, []); // Removemos activeSensor de las dependencias

  // Listen for sensor data updates
  useEffect(() => {
    if (!sensorIds.length) return;

    const listeners: { [key: string]: () => void } = {};

    sensorIds.forEach(sensorId => {
      const updateSensorData = (type: 'temperature' | 'humidity', data: SensorDataPoint[]) => {
        setSensorsData(prev => ({
          ...prev,
          [sensorId]: {
            ...(prev[sensorId] || {}),
            [type]: data
          }
        }));
      };

      // Temperature listener
      const tempRef = ref(db, `sensors/${sensorId}/temperature`);
      const tempQuery = query(tempRef, limitToLast(15));
      
      const tempListener = onValue(tempQuery, snapshot => {
        if (snapshot.exists()) {
          const data = Object.values(snapshot.val())
            .map((item: any) => ({
              time: Number(item.time),
              value: item.value,
            }))
            .sort((a, b) => a.time - b.time);

          updateSensorData('temperature', data);
        }
      });

      // Humidity listener
      const humRef = ref(db, `sensors/${sensorId}/humidity`);
      const humQuery = query(humRef, limitToLast(15));
      
      const humListener = onValue(humQuery, snapshot => {
        if (snapshot.exists()) {
          const data = Object.values(snapshot.val())
            .map((item: any) => ({
              time: Number(item.time),
              value: item.value,
            }))
            .sort((a, b) => a.time - b.time);

          updateSensorData('humidity', data);
        }
      });

      listeners[`temp_${sensorId}`] = () => off(tempQuery, 'value', tempListener);
      listeners[`hum_${sensorId}`] = () => off(humQuery, 'value', humListener);
    });

    // Cleanup function
    return () => {
      Object.values(listeners).forEach(cleanup => cleanup());
    };
  }, [sensorIds]); // Remove any other dependencies

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: true,
          color: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
        }
      }
    },
    plugins: {
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
        padding: 12,
        cornerRadius: 4
      }
    }
  };

  const tempChartOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: {
        grid: {
          display: true,
          color: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
        },
        min: 0,
        max: 45,
      }
    }
  };

  const humidityChartOptions = {
    ...baseChartOptions,
    scales: {
      ...baseChartOptions.scales,
      y: {
        grid: {
          display: true,
          color: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
        },
        min: 0,
        max: 800,
      }
    }
  };

  // Get current sensor data
  const currentSensorData = activeSensor ? sensorsData[activeSensor] : null;
  const lastTemp = currentSensorData?.temperature?.[currentSensorData.temperature?.length - 1]?.value ?? 0;
  const lastHumidity = currentSensorData?.humidity?.[currentSensorData.humidity?.length - 1]?.value ?? 0;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t.welcomeMessage}</h1>
      
      {/* Sensor tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto">
        {sensorIds.map((sensorId) => (
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
                {currentSensorData.temperature && (
                  <Line
                    data={{
                      labels: currentSensorData.temperature.map(item => formatTime(item.time)),
                      datasets: [{
                        label: `${t.temperature} (°C)`,
                        data: currentSensorData.temperature.map(item => item.value),
                        borderColor: "#22c55e",
                        backgroundColor: "#22c55e20",
                        borderWidth: 2,
                        tension: 0.4,
                        pointBackgroundColor: "#22c55e",
                        pointBorderColor: "#22c55e",
                      }],
                    }}
                    options={tempChartOptions}
                  />
                )}
              </div>
            </div>

            {/* Humidity Chart */}
            <div className="bg-card text-card-foreground rounded-xl shadow p-6 flex flex-col">
              <h3 className="text-lg font-semibold text-info mb-4">{t.humidityChart}</h3>
              <div className="h-[400px] w-full">
                {currentSensorData.humidity && (
                  <Line
                    data={{
                      labels: currentSensorData.humidity.map(item => formatTime(item.time)),
                      datasets: [{
                        label: `${t.humidity} (%)`,
                        data: currentSensorData.humidity.map(item => item.value),
                        borderColor: "#3b82f6",
                        backgroundColor: "#3b82f620",
                        borderWidth: 2,
                        tension: 0.4,
                        pointBackgroundColor: "#3b82f6",
                        pointBorderColor: "#3b82f6",
                      }],
                    }}
                    options={humidityChartOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}