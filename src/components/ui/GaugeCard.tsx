// components/GaugeCard.tsx
import React from "react";

type GaugeCardProps = {
  label: string;
  value: number;
  unit: string;
  icon: JSX.Element;
  color: string; // ejemplo: 'stroke-green-500'
};

export default function GaugeCard({ label, value, unit, icon, color }: GaugeCardProps) {
  const percentage = (value / 100) * 360;

  return (
    <div className="bg-card text-card-foreground rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            className={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 360) * 283} 283`}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">
            {value}
            {unit}
          </span>
        </div>
      </div>
    </div>
  )
}
