// scripts/app.js
// ============= INICIO DE app.js =============
import * as datos from './datos.js';
import * as ui from './ui.js';
import configurarEventListeners from './eventos.js';
import {
    construirMapaMaterialAEquipo,
    inicializarAlmacenamientoMateriales,
    cargarMaterialesDesdeLocalStorage,
    guardarMaterialesEnLocalStorage
} from './materiales.js';
import * as galeria from './galeria.js';
import * as conversiones from './conversiones.js';
import { simularUso } from './simulacion.js';
import * as modales from './modales.js';
import { cargarEquiposDesdeLocalStorage } from './arte.js';
import { crearBaseSelector, actualizarEstadoBase } from './baseLogic.js';

const estadoApp = {
    equipoActual: 'Espada',
    claseActual: 'Normal',
    nivelActual: '1',
    colorActual: 'blanco',
    colorPorMaterialSeleccionado: {},
    almacenMateriales: {},
    cambiosPendientes: false,
    colorNoSeleccionado: '#808080',
    imagenesGaleria: [],
    indiceCarruselActual: 0,
    esOffline: !navigator.onLine,
    colorBaseSeleccionado: null,
    mapaColores: datos.mapaColores,
    materialesData: datos.datosMateriales,
    intervaloAutoguardado: null
};

function iniciarApp() {
    try {
        // Asignar datos importantes al estado
        estadoApp.materialesData = datos.datosMateriales;
        estadoApp.mapaColores = datos.mapaColores;

        // Construir estructuras de datos necesarias
        construirMapaMaterialAEquipo(estadoApp);
        inicializarAlmacenamientoMateriales(estadoApp);

        // Cargar datos persistentes
        cargarMaterialesDesdeLocalStorage(estadoApp);
        galeria.cargarImagenesGuardadas(estadoApp);
        cargarEquiposDesdeLocalStorage();

        // Configurar todos los event listeners
        configurarEventListeners(estadoApp);

        // Inicializar la interfaz de usuario
        ui.actualizarUI(estadoApp);

        // Configurar el intervalo de autoguardado
        estadoApp.intervaloAutoguardado = setInterval(() => {
            if (estadoApp.cambiosPendientes) {
                guardarMaterialesEnLocalStorage(estadoApp);
                console.log('Autoguardado realizado');
                estadoApp.cambiosPendientes = false;
            }
        }, 30000); // 30 segundos

        // Asignar la función de simulación al estado
        estadoApp.simularUso = simularUso;

        // Mostrar mensaje offline si es necesario
        if (estadoApp.esOffline) {
            mostrarMensajeOffline();
        }
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        modales.mostrarMensaje('Error Crítico', 
            'No se pudo iniciar la aplicación. Por favor, recarga la página.', 'error');
    }
}

function mostrarMensajeOffline() {
    const offlineMessage = document.getElementById('offline-message');
    if (offlineMessage) {
        offlineMessage.style.display = 'block';
    }
    
    modales.mostrarMensaje('Modo Offline',
        'Actualmente no tienes conexión a internet. Los cambios se guardarán localmente y se sincronizarán cuando recuperes la conexión.', 'info');
}

document.addEventListener('DOMContentLoaded', iniciarApp);

window.addEventListener('beforeunload', (e) => {
    if (estadoApp.cambiosPendientes) {
        const message = 'Hay cambios sin guardar. ¿Seguro que deseas salir?';
        e.returnValue = message;
        return message;
    }
});

window.addEventListener('unload', () => {
    try {
        if (estadoApp.cambiosPendientes) {
            guardarMaterialesEnLocalStorage(estadoApp);
        }
        
        // Limpiar el intervalo de autoguardado
        if (estadoApp.intervaloAutoguardado) {
            clearInterval(estadoApp.intervaloAutoguardado);
        }
    } catch (error) {
        console.error('Error al cerrar la aplicación:', error);
    }
});

window.addEventListener('online', () => {
    estadoApp.esOffline = false;
    const offlineMessage = document.getElementById('offline-message');
    if (offlineMessage) offlineMessage.style.display = 'none';
    
    modales.mostrarMensaje('Conexión Restablecida', 
        'Se ha restablecido la conexión a internet. Los cambios locales se sincronizarán.', 'success');
});

window.addEventListener('offline', () => {
    estadoApp.esOffline = true;
    mostrarMensajeOffline();
});

// Manejo de errores global no controlados
window.addEventListener('error', (event) => {
    console.error('Error no controlado:', event.error);
    modales.mostrarMensaje('Error Inesperado', 
        'Se produjo un error inesperado. Por favor, recarga la aplicación.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no controlada:', event.reason);
    modales.mostrarMensaje('Error en Promesa', 
        'Se produjo un error al procesar una operación. Por favor, inténtalo de nuevo.', 'error');
});
// ============= FIN DE app.js =============