import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';

// Este es un ejemplo de cómo se vería `firebaseConfig` para el frontend.
// Debes obtener estos valores desde la consola de Firebase en la sección "Configuración del proyecto".
const firebaseConfig = {
    apiKey: "AIzaSyD4FNXIK9jMDWZJThxEA-4onTsFNLdTB-8",
    authDomain: "nematool-8eb04.firebaseapp.com",
    databaseURL: "https://nematool-8eb04.firebaseio.com",
    projectId: "nematool-8eb04",
    storageBucket: "nematool-8eb04.appspot.com",
    messagingSenderId: "325732295839",
    appId: "1:325732295839:web:690e159b54bb8c4eadaeaa",
    measurementId: "G-QWWE3JT7FK"
  };

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging };
