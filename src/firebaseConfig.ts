// Importa los módulos de Firebase
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Reemplaza con la configuración de tu proyecto Firebase
const firebaseConfig = {
  databaseURL: "https://plantitas-base-default-rtdb.firebaseio.com", // Reemplaza con la URL de tu base de datos
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Realtime Database y obtén una referencia al servicio
const database = getDatabase(app);
const db = database; // Exporta la instancia de la base de datos para usarla en otros archivos
export { db };