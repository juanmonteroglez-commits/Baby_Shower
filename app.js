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
const estadoMensaje = document.getElementById('estado-mensaje');
const coleccionMensajes = collection(db, "mensajes");

if (!formulario || !contenedorMensajes || !estadoMensaje) {
  console.error('Faltan elementos del formulario de mensajes en el DOM.');
} else {
  // Lógica para GUARDAR un mensaje nuevo cuando le dan a "Enviar"
  formulario.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita que la página recargue al enviar

    const nombreInput = document.getElementById('nombre-mensaje');
    const textoInput = document.getElementById('texto-mensaje');
    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const texto = textoInput ? textoInput.value.trim() : '';

    if (!nombre || !texto) {
      estadoMensaje.textContent = 'Escribe tu nombre y mensaje antes de enviar.';
      return;
    }

    try {
      await addDoc(coleccionMensajes, {
        nombre: nombre,
        texto: texto,
        fecha: serverTimestamp() // Le pone la hora de los servidores de Google
      });
      formulario.reset(); // Limpia las cajas de texto tras enviar
      estadoMensaje.textContent = 'Tu mensaje quedó guardado con mucho cariño.';
    } catch (error) {
      console.error("Error al guardar:", error);
      estadoMensaje.textContent = 'No se pudo guardar el mensaje. Revisa la conexión con Firebase o las reglas de Firestore.';
    }
  });
}

// Lógica para MOSTRAR los mensajes y actualizar en tiempo real
const consulta = query(coleccionMensajes, orderBy("fecha", "desc"));

function obtenerFechaValida(valorFecha) {
  if (!valorFecha) return null;

  if (typeof valorFecha.toDate === 'function') {
    const fecha = valorFecha.toDate();
    return Number.isNaN(fecha.getTime()) ? null : fecha;
  }

  const fecha = new Date(valorFecha);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

function formatearFecha(valorFecha) {
  const fecha = obtenerFechaValida(valorFecha);
  if (!fecha) return 'Justo ahora';

  return `${fecha.toLocaleDateString('es-MX')} ${fecha.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  })}`;
}

onSnapshot(consulta, (snapshot) => {
  contenedorMensajes.innerHTML = ''; // Limpia los mensajes viejos antes de mostrar los nuevos

  if (snapshot.empty) {
    const vacio = document.createElement('p');
    vacio.className = 'estado-mensaje';
    vacio.textContent = 'Aún no hay mensajes para este bebé. ¡Sé el primero!';
    contenedorMensajes.appendChild(vacio);
    return;
  }

  snapshot.forEach((doc) => {
    const mensaje = doc.data() || {};
    const nombreMensaje = (mensaje.nombre || 'Invitado').toString().trim();
    const textoMensaje = (mensaje.texto ?? mensaje.mensaje ?? mensaje.message ?? '').toString().trim();

    if (!textoMensaje) return;

    const tarjeta = document.createElement('article');
    tarjeta.className = 'mensaje-bebe';

    const nombre = document.createElement('strong');
    nombre.textContent = nombreMensaje;

    const texto = document.createElement('p');
    texto.textContent = textoMensaje;

    const fecha = document.createElement('small');
    fecha.textContent = formatearFecha(mensaje.fecha);

    tarjeta.appendChild(nombre);
    tarjeta.appendChild(texto);
    tarjeta.appendChild(fecha);
    contenedorMensajes.appendChild(tarjeta);
  });
}, (error) => {
  console.error('Error al cargar mensajes:', error);
  const codigo = error && error.code ? ` (${error.code})` : '';
  estadoMensaje.textContent = `No se pudieron cargar los mensajes${codigo}. Revisa las reglas de Firestore o que la base esté activa.`;
  contenedorMensajes.innerHTML = '<p class="estado-mensaje">No tienes permisos para leer mensajes o la base de datos no está habilitada.</p>';
});