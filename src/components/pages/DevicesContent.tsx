import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Thermometer, Droplet, ChevronLeft, Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { ref, onValue, query, limitToLast, off } from "firebase/database";
import { db } from "@/firebaseConfig";

interface DeviceData {
  temperature: number;
  humidity: number;
  avgTemperature?: number;
}

interface HumidityState {
  state: string;
  message: string;
  emoji: string;
}

const getHumidityState = (humidity: number): HumidityState => {
  if (humidity < 120) {
    return {
      state: "Muy seco",
      message: "¡Tu planta tiene sed! Necesita agua urgentemente.",
      emoji: "💧"
    };
  }
  if (humidity < 240) {
    return {
      state: "Poco húmedo",
      message: "La tierra está un poco seca. Considera regar pronto.",
      emoji: "💧💧"
    };
  }
  if (humidity < 420) {
    return {
      state: "Húmedo",
      message: "La humedad es ideal. ¡Tu planta está feliz!",
      emoji: "💧💧💧"
    };
  }
  if (humidity < 540) {
    return {
      state: "Muy húmedo",
      message: "La tierra está bastante húmeda. ¡Cuidado con el exceso de agua!",
      emoji: "💧💧💧💧"
    };
  }
  return {
    state: "Saturado",
    message: "¡Demasiada agua! Podría ser malo para las raíces en algunos casos.",
    emoji: "💧💧💧💧💧"
  };
};

type MockDataType = {
  [key: string]: DeviceData;
}

export default function DevicesContent() {
  const { language } = useAppContext();
  const t = translations[language];
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [sensorsData, setSensorsData] = useState<{ [key: string]: DeviceData }>({});
  const sensorsRef = useRef(ref(db, "sensors"));

  // Escuchar cambios en tiempo real
  useEffect(() => {
    const listeners: { [key: string]: () => void } = {};

    const sensorsListener = onValue(sensorsRef.current, (snapshot) => {
      if (snapshot.exists()) {
        const sensors = Object.keys(snapshot.val());
        
        sensors.forEach(sensorId => {
          // Listener para temperatura
          const tempRef = ref(db, `sensors/${sensorId}/temperature`);
          const tempQuery = query(tempRef, limitToLast(1));
          
          const tempListener = onValue(tempQuery, snapshot => {
            if (snapshot.exists()) {
              const tempData = Object.values(snapshot.val())[0] as any;
              setSensorsData(prev => ({
                ...prev,
                [sensorId]: {
                  ...prev[sensorId],
                  temperature: tempData.value,
                }
              }));
            }
          });

          // Listener para humedad
          const humRef = ref(db, `sensors/${sensorId}/humidity`);
          const humQuery = query(humRef, limitToLast(1));
          
          const humListener = onValue(humQuery, snapshot => {
            if (snapshot.exists()) {
              const humData = Object.values(snapshot.val())[0] as any;
              setSensorsData(prev => ({
                ...prev,
                [sensorId]: {
                  ...prev[sensorId],
                  humidity: humData.value,
                  avgTemperature: prev[sensorId]?.temperature || 0, // Mantenemos el promedio por ahora
                }
              }));
            }
          });

          listeners[`temp_${sensorId}`] = () => off(tempQuery, 'value', tempListener);
          listeners[`hum_${sensorId}`] = () => off(humQuery, 'value', humListener);
        });
      }
    });

    // Limpieza de listeners
    return () => {
      Object.values(listeners).forEach(cleanup => cleanup());
      off(sensorsRef.current, 'value', sensorsListener);
    };
  }, []);

  // Renderizar todas las macetas disponibles
  const renderDevices = () => (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-6">Macetas activas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(sensorsData).map(([deviceId, data]) => (
          <Card 
            key={deviceId}
            className={`p-4 cursor-pointer transition-colors hover:border-primary ${
              selectedDevice === deviceId ? 'border-primary bg-primary/10' : ''
            }`}
            onClick={() => {
              if (selectedDevice === deviceId) {
                setSelectedDevice(null);
              } else {
                setSelectedDevice(deviceId);
              }
            }}
          >
            <h3 className="font-semibold text-center">
              Maceta {deviceId.match(/\d+/) ? deviceId.match(/\d+/)![0] : deviceId}
            </h3>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t.devices}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          {renderDevices()}
        </Card>
        <Card className="p-6">
          {selectedDevice && sensorsData[selectedDevice] ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Maceta {selectedDevice}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowInfo(true)}
                  className="hover:bg-primary/10"
                >
                  <Info className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-4">Temperatura</h3>
                    <div className="relative h-64 mx-auto">
                      <div className="absolute inset-0">
                        <svg viewBox="0 0 40 120" className="w-full h-full">
                          {/* Termómetro base */}
                          <rect x="15" y="10" width="10" height="100" fill="white" stroke="currentColor" strokeWidth="1" rx="5" />
                          <circle cx="20" cy="100" r="10" fill="white" stroke="currentColor" strokeWidth="1" />
                          {/* Mercurio */}
                          <rect 
                            x="17" 
                            y={110 - (sensorsData[selectedDevice].temperature * 3.33)} 
                            width="6" 
                            height={sensorsData[selectedDevice].temperature * 3.33} 
                            fill="hsl(var(--success))" 
                            rx="3" 
                          />
                          <circle cx="20" cy="100" r="8" fill="hsl(var(--success))" />
                          {/* Marcas de temperatura */}
                          {[0, 10, 20, 30].map((temp) => (
                            <g key={temp}>
                              <line
                                x1="24"
                                y1={110 - (temp * 3.33)}
                                x2="28"
                                y2={110 - (temp * 3.33)}
                                stroke="currentColor"
                                strokeWidth="1"
                              />
                              <text
                                x="30"
                                y={110 - (temp * 3.33)}
                                fontSize="7"
                                fill="currentColor"
                                dominantBaseline="middle"
                                fontFamily="system-ui"
                                textAnchor="start"
                              >
                                {temp}°C
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <div className="text-2xl font-bold">
                        {sensorsData[selectedDevice].temperature.toFixed(1)}°C
                      </div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Promedio: {(sensorsData[selectedDevice].avgTemperature ?? 0).toFixed(1)}°C
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <h3 className="text-lg font-medium mb-2">Humedad</h3>
                    <div className="relative w-full h-40 flex flex-col items-center">
                      <svg className="w-full h-32" viewBox="0 0 100 60">
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke="hsl(var(--secondary))"
                          strokeWidth="6"
                        />
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          strokeWidth="6"
                          stroke="url(#gradient)"
                          strokeDasharray={`${(sensorsData[selectedDevice].humidity / 1000) * 126} 126`}
                        />
                        <defs>
                          <linearGradient id="gradient">
                            <stop offset="0%" stopColor="hsl(120, 61%, 34%)" />
                            <stop offset="50%" stopColor="hsl(120, 61%, 41%)" />
                            <stop offset="100%" stopColor="hsl(120, 61%, 48%)" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">
                          {sensorsData[selectedDevice].humidity > 600 
                            ? '> 100' 
                            : ((sensorsData[selectedDevice].humidity / 600) * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm text-muted-foreground">de la tierra</span>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Estado:</div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {getHumidityState(sensorsData[selectedDevice].humidity).emoji} {getHumidityState(sensorsData[selectedDevice].humidity).state}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {getHumidityState(sensorsData[selectedDevice].humidity).message}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tipo de Planta y Estado de Humedad Ideal:</p>
                        <p className="text-sm text-muted-foreground">Plantas de interior: 40-70%</p>
                      </div>
                    </div>
                  </Card>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = `/statistics?device=${selectedDevice}`}
                    className="gap-2"
                  >
                    Ir a Estadísticas
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Por favor, selecciona una maceta
            </div>
          )}
        </Card>
      </div>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Niveles de Humedad
              <DialogClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Intervalos de Medición:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  0 - 300: Seco
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  300 - 600: Húmedo
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  {">"} 600: Mojado
                </li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
