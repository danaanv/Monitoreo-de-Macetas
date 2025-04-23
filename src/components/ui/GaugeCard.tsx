// components/GaugeCard.tsx
import React from "react";

type Props = {
  label: string;
  value: number;
  unit: string;
  icon: JSX.Element;
  color: string; // ejemplo: 'stroke-green-500'
};

export default function GaugeCard({ label, value, unit, icon, color }: Props) {
  const percent = Math.min(Math.max((value - 10) / 90, 0), 1);

  return (
    <div className="bg-white rounded-xl p-6 text-center shadow relative">
      <p className="text-gray-600 mb-2 font-medium">{label}</p>
      <div className="relative flex items-center justify-center">
        <svg viewBox="0 0 36 36" className="w-28 h-28">
          <path
            className="text-gray-200"
            strokeWidth="3"
            fill="none"
            stroke="currentColor"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831
               a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            d="M18 2.0845
               a 15.9155 15.9155 0 0 1 0 31.831"
            strokeDasharray={`${percent * 100}, 100`}
            transform="rotate(-90 18 18)"
          />
        </svg>
        <div className="absolute text-2xl font-semibold">{value}{unit}</div>
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          {icon}
        </div>
      </div>
    </div>
  );
}
