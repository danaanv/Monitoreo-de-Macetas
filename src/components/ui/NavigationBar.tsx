import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/firebaseConfig";
import { Droplet } from "lucide-react";
import { useTheme } from "next-themes";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";
import { Icons } from "@/components/icons";

export default function NavigationBar() {
  const [sensorCount, setSensorCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage } = useAppContext();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const sensorsRef = ref(db, "sensors");
    const unsubscribe = onValue(sensorsRef, (snapshot) => {
      if (snapshot.exists()) {
        setSensorCount(Object.keys(snapshot.val()).length);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Monitoreo de Macetas</h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Sensor counter */}
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Droplet className="w-5 h-5" />
          <span>{translations[language].activeDevices}: {sensorCount}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label={translations[language].toggleTheme}
        >
          {theme === "dark" ? <Icons.light className="w-5 h-5" /> : <Icons.dark className="w-5 h-5" />}
        </button>

        {/* Language selector */}
        <button
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label={translations[language].changeLanguage}
        >
          {language.toUpperCase()}
        </button>
      </div>
    </header>
  );
}
