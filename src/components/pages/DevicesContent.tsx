import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Thermometer, Droplet, ChevronLeft, Info, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface DeviceData {
  temperature: number;
  humidity: number;
  avgTemperature?: number;
}

const getHumidityState = (humidity: number) => {
  if (humidity < 300) return "Seco";
  if (humidity < 600) return "Húmedo";
  return "Mojado";
};

type MockDataType = {
  [key: string]: DeviceData;
}

export default function DevicesContent() {
  const { language } = useAppContext();
  const t = translations[language];
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // Datos de ejemplo - en producción vendrían de Firebase
  const mockData: MockDataType = {
    "device1": { temperature: 12, humidity: 107, avgTemperature: 15 },
    "device2": { temperature: 15, humidity: 450, avgTemperature: 17 },
  };

  const floors = [
    { id: "floor1", name: "Primer Piso" },
    { id: "floor2", name: "Segundo Piso" },
    { id: "floor3", name: "Tercer Piso" }
  ];

  const handleBack = () => {
    setSelectedFloor(null);
    setSelectedDevice(null);
  };

  const renderFloorSelection = () => (
    <div className="grid grid-cols-1 gap-4 w-full max-w-md mx-auto">
      {floors.map((floor) => (
        <button
          key={floor.id}
          className="p-4 border-2 border-border rounded-lg text-center transition-colors hover:border-primary w-full"
          onClick={() => setSelectedFloor(floor.id)}
        >
          <span className="text-lg font-medium">{floor.name}</span>
        </button>
      ))}
    </div>
  );

  const renderFloorDevices = () => {
    const currentFloor = floors.find(f => f.id === selectedFloor);
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="hover:bg-primary/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-medium">Volver</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(mockData).map(([deviceId, data]) => (
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
              <h3 className="font-semibold text-center">Maceta {deviceId}</h3>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{t.devices}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          {selectedFloor ? renderFloorDevices() : renderFloorSelection()}
        </Card>

        <Card className="p-6">
          {selectedDevice ? (
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
                            y={110 - (mockData[selectedDevice].temperature * 3.33)} 
                            width="6" 
                            height={mockData[selectedDevice].temperature * 3.33} 
                            fill="#ef4444" 
                            rx="3" 
                          />
                          <circle cx="20" cy="100" r="8" fill="#ef4444" />
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
                      <div className="text-2xl font-bold">{mockData[selectedDevice].temperature}°C</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        Promedio semanal: {mockData[selectedDevice].avgTemperature}°C
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
                          strokeDasharray={`${(mockData[selectedDevice].humidity / 1000) * 126} 126`}
                        />
                        <defs>
                          <linearGradient id="gradient">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#3b82f6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{mockData[selectedDevice].humidity}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Estado:</div>
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                        {getHumidityState(mockData[selectedDevice].humidity)}
                      </span>
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
