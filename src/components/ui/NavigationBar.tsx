import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/firebaseConfig";
import { 
  Settings,
  SunMedium,
  Moon,
  Droplet,
  UserCircle 
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppContext } from "@/contexts/AppContext";
import { translations } from "@/lib/i18n";
import { Language } from "@/types/app";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

interface UserProfile {
  name: string;
  role: string;
  email: string;
}

export default function NavigationBar() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Admin",
    role: "Administrator",
    email: "admin@example.com"
  });
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
    <header className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4">
        <div>
          <h1 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{userProfile.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{userProfile.role}</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Sensor counter */}
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Droplet className="w-5 h-5" />
          <span>{translations[language].activeSensors}: {sensorCount}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label={translations[language].toggleTheme}
        >
          {theme === "dark" ? <SunMedium className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Language selector */}
        <button
          onClick={() => setLanguage(language === "es" ? "en" : "es")}
          className="px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          aria-label={translations[language].changeLanguage}
        >
          {language.toUpperCase()}
        </button>

        {/* Settings dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <Settings className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="flex items-center space-x-2">
              <UserCircle className="w-4 h-4" />
              <span>{translations[language].profile}</span>
            </DropdownMenuItem>
            {/* Add more menu items as needed */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
