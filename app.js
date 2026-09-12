// Importamos las herramientas de Firebase directamente desde internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// REEMPLAZA ESTO CON LOS DATOS EXACTOS QUE COPIASTE DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDORlMAeFZreiEbcro5YvfAa5iS-hU0p8c",
  authDomain: "baby-shower-invitacion.firebaseapp.com",
  projectId: "baby-shower-invitacion",
  storageBucket: "baby-shower-invitacion.firebasestorage.app",
  messagingSenderId: "959118952083",
  appId: "1:959118952083:web:617ddbbc43ca9bb6012f66"
};

// Inicializamos Firebase y la Base de Datos
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Conectamos nuestro JavaScript con el HTML
const formulario = document.getElementById('formulario-mensaje');
const contenedorMensajes = document.getElementById('lista-mensajes');
const coleccionMensajes = collection(db, "mensajes");

// Lógica para GUARDAR un mensaje nuevo cuando le dan a "Enviar"
formulario.addEventListener('submit', async (e) => {
  e.preventDefault(); // Evita que la página recargue al enviar
  
  const nombre = document.getElementById('nombre-mensaje').value.trim();
  const texto = document.getElementById('texto-mensaje').value.trim();
  
  try {
    await addDoc(coleccionMensajes, {
      nombre: nombre,
      texto: texto,
      fecha: serverTimestamp() // Le pone la hora de los servidores de Google
    });
    formulario.reset(); // Limpia las cajas de texto tras enviar
  } catch (error) {
    console.error("Error al guardar:", error);
    alert("Hubo un error al enviar el mensaje.");
  }
});

// Lógica para MOSTRAR los mensajes y actualizar en tiempo real
const consulta = query(coleccionMensajes, orderBy("fecha", "desc"));

onSnapshot(consulta, (snapshot) => {
  contenedorMensajes.innerHTML = ''; // Limpia los mensajes viejos antes de mostrar los nuevos
  
  snapshot.forEach((doc) => {
    const mensaje = doc.data();
    let fechaFormateada = "Justo ahora";
    
    if (mensaje.fecha) {
      const fechaObjeto = mensaje.fecha.toDate();
      // Da formato a la fecha: ej. "8/9/2026 15:30:00"
      fechaFormateada = fechaObjeto.toLocaleDateString() + ' ' + fechaObjeto.toLocaleTimeString(); 
    }

    const tarjeta = document.createElement('article');
    tarjeta.className = 'mensaje-bebe';

    const nombre = document.createElement('strong');
    nombre.textContent = mensaje.nombre;

    const texto = document.createElement('p');
    texto.textContent = mensaje.texto;

    const fecha = document.createElement('small');
    fecha.textContent = fechaFormateada;

    tarjeta.appendChild(nombre);
    tarjeta.appendChild(fecha);
    tarjeta.appendChild(texto);
    contenedorMensajes.appendChild(tarjeta);
  });
});