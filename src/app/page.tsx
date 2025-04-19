"use client";

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getCurrentEnvironmentalData, getHistoricalEnvironmentalData} from "@/services/environmental";
import {useEffect, useState} from "react";
import {EnvironmentalData, HistoricalEnvironmentalData} from "@/services/environmental";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

export default function Home() {
  const [currentData, setCurrentData] = useState<EnvironmentalData | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalEnvironmentalData[]>([]);
  const [unit, setUnit] = useState<"celsius" | "fahrenheit">("celsius");

  useEffect(() => {
    const fetchData = async () => {
      const current = await getCurrentEnvironmentalData();
      setCurrentData(current);

      const historical = await getHistoricalEnvironmentalData("daily");
      setHistoricalData(historical);
    };

    fetchData();
  }, []);

  const convertedTemperature = currentData
    ? unit === "celsius"
      ? currentData.temperatureCelsius
      : (currentData.temperatureCelsius * 9) / 5 + 32
    : null;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Temperature</CardTitle>
          </CardHeader>
          <CardContent>
            {convertedTemperature !== null ? (
              <div className="text-4xl font-bold">
                {convertedTemperature.toFixed(1)}°{unit === "celsius" ? "C" : "F"}
              </div>
            ) : (
              <div>Loading...</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Humidity</CardTitle>
          </CardHeader>
          <CardContent>
            {currentData ? (
              <div className="text-4xl font-bold">{currentData.humidity.toFixed(1)}%</div>
            ) : (
              <div>Loading...</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Temperature Trend (Daily)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="timestamp"/>
              <YAxis/>
              <Tooltip/>
              <Area type="monotone" dataKey="temperatureCelsius" stroke="#3498db" fill="#3498db"/>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Humidity Trend (Daily)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="timestamp"/>
              <YAxis/>
              <Tooltip/>
              <Area type="monotone" dataKey="humidity" stroke="#2c3e50" fill="#2c3e50"/>
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
