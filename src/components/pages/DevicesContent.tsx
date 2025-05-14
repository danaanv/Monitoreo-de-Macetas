// components/pages/DevicesContent.tsx
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";

export default function DevicesContent() {
  const { language } = useAppContext();
  const t = translations[language];
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t.devices}</h1>
      {/* Contenido de dispositivos */}
    </div>
  );
}
