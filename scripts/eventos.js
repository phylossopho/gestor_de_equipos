// scripts/eventos.js
// ============= INICIO DE eventos.js =============
import * as ui from './ui.js';
import * as materiales from './materiales.js';
import * as galeria from './galeria.js';
import * as csv from './csv.js';
import * as modales from './modales.js';
import { actualizarEstadoBase } from './baseLogic.js';

export default function configurarEventListeners(estado) {
    try {
        // ===== [1] SELECTORES PRINCIPALES =====
        configurarSelectoresPrincipales(estado);
        
        // ===== [2] BOTONES PRINCIPALES =====
        configurarBotonesPrincipales(estado);
        
        // ===== [3] GALERÍA DE IMÁGENES =====
        configurarEventosGaleria(estado);
        
        // ===== [4] CARRUSEL DE IMÁGENES =====
        configurarEventosCarrusel(estado);
        
        // ===== [5] PESTAÑAS =====
        configurarEventosPestanas(estado);
        
        // ===== [6] MODALES Y CIERRE =====
        configurarEventosModales();
        
        // ===== [7] EVENTOS GLOBALES =====
        configurarEventosGlobales(estado);
        
        console.log('Event listeners configurados con éxito');
    } catch (error) {
        console.error('Error configurando event listeners:', error);
        modales.mostrarMensaje('Error', 'Error al configurar eventos', 'error');
    }
}

function configurarSelectoresPrincipales(estado) {
    // Selector de equipo
    const equipmentSelect = document.getElementById('equipment-select');
    if (equipmentSelect) {
        equipmentSelect.addEventListener('change', (e) => {
            estado.equipoActual = e.target.value;
            ui.actualizarUI(estado);
            actualizarEstadoBase(estado);
        });
    }

    // Selector de nivel
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) {
        levelSelect.addEventListener('change', (e) => {
            estado.nivelActual = e.target.value;
            ui.actualizarUI(estado);
            actualizarEstadoBase(estado);
        });
    }

    // Selector de clase
    const classSelect = document.getElementById('class-select');
    if (classSelect) {
        classSelect.addEventListener('change', (e) => {
            estado.claseActual = e.target.value;
            ui.actualizarUI(estado);
            actualizarEstadoBase(estado);
            
            // Restablecer selector de color cuando se cambia de clase
            if (estado.claseActual !== "Campeón") {
                const colorSelect = document.getElementById('color-select');
                if (colorSelect) {
                    estado.colorActual = "blanco";
                    colorSelect.value = "blanco";
                }
            }
        });
    }

    // Selector de color
    const colorSelect = document.getElementById('color-select');
    if (colorSelect) {
        colorSelect.addEventListener('change', (e) => {
            estado.colorActual = e.target.value;
            ui.actualizarUI(estado);
            actualizarEstadoBase(estado);
        });
    }
}

function configurarBotonesPrincipales(estado) {
    // Botón Exportar CSV (desktop)
    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => csv.exportarCSV(estado));
    }

    // Botón Importar CSV (desktop)
    const importBtn = document.getElementById('import-csv');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            document.getElementById('csv-file').click();
        });
    }

    // Botones móviles
    const mobileExport = document.getElementById('mobile-export-csv');
    if (mobileExport) {
        mobileExport.addEventListener('click', () => {
            csv.exportarCSV(estado);
            modales.ocultarMenuCSVMovil();
        });
    }

    const mobileImport = document.getElementById('mobile-import-csv');
    if (mobileImport) {
        mobileImport.addEventListener('click', () => {
            document.getElementById('csv-file').click();
            modales.ocultarMenuCSVMovil();
        });
    }

    // Toggle del menú CSV móvil
    const csvMenuToggle = document.getElementById('csv-menu-toggle');
    if (csvMenuToggle) {
        csvMenuToggle.addEventListener('click', modales.alternarMenuCSVMovil);
    }

    // Input de archivo CSV
    const csvFileInput = document.getElementById('csv-file');
    if (csvFileInput) {
        csvFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                csv.importarCSV(e.target.files[0], estado);
                ui.actualizarUI(estado);
                actualizarEstadoBase(estado);
                e.target.value = '';
            }
        });
    }

    // Botón Mostrar Materiales
    const showMaterialsBtn = document.getElementById('show-materials');
    if (showMaterialsBtn) {
        showMaterialsBtn.addEventListener('click', () => {
            materiales.abrirListaMateriales(estado);
        });
    }

    // Botón USAR Materiales (CON ACTUALIZACIÓN DE UI MEJORADA)
    const useMaterialsBtn = document.getElementById('use-materials');
    if (useMaterialsBtn) {
        useMaterialsBtn.addEventListener('click', () => {
            materiales.usarMateriales(estado);
            // FORZAR ACTUALIZACIÓN COMPLETA DE LA UI
            ui.actualizarUI(estado);
            actualizarEstadoBase(estado);
        });
    }
}

function configurarEventosGaleria(estado) {
    // Botón Galería
    const galleryButton = document.getElementById('gallery-button');
    if (galleryButton) {
        galleryButton.addEventListener('click', () => {
            galeria.abrirGaleria(estado);
        });
    }

    // Botón Agregar Imagen
    const addImageButton = document.getElementById('add-image-button');
    if (addImageButton) {
        addImageButton.addEventListener('click', () => {
            document.getElementById('gallery-file-input').click();
        });
    }

    // Input de archivo de galería
    const galleryFileInput = document.getElementById('gallery-file-input');
    if (galleryFileInput) {
        galleryFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                galeria.agregarImagenAGaleria(e.target.files[0], estado);
            }
        });
    }
}

function configurarEventosCarrusel(estado) {
    // Botón Cerrar Carrusel
    const carouselClose = document.getElementById('carousel-close');
    if (carouselClose) {
        carouselClose.addEventListener('click', () => {
            document.getElementById('carousel-modal').style.display = 'none';
        });
    }

    // Botón Imagen Anterior
    const carouselPrev = document.getElementById('carousel-prev');
    if (carouselPrev) {
        carouselPrev.addEventListener('click', () => {
            galeria.mostrarImagenAnteriorCarrusel(estado);
        });
    }

    // Botón Imagen Siguiente
    const carouselNext = document.getElementById('carousel-next');
    if (carouselNext) {
        carouselNext.addEventListener('click', () => {
            galeria.mostrarImagenSiguienteCarrusel(estado);
        });
    }
}

function configurarEventosPestanas(estado) {
    const botonesPestaña = document.querySelectorAll('.tab-button');
    if (botonesPestaña.length > 0) {
        botonesPestaña.forEach(boton => {
            boton.addEventListener('click', () => {
                // Desactivar todas las pestañas
                botonesPestaña.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(contenido => {
                    contenido.classList.remove('active');
                });

                // Activar la pestaña seleccionada
                boton.classList.add('active');
                const idPestaña = boton.getAttribute('data-tab');
                const tabContent = document.getElementById(`${idPestaña}-tab`);
                
                if (tabContent) {
                    tabContent.classList.add('active');
                    
                    // Forzar actualización de UI
                    ui.actualizarUI(estado);
                    actualizarEstadoBase(estado);
                }
            });
        });
    }
}

function configurarEventosModales() {
    // Botones de cierre
    const botonesCerrar = document.querySelectorAll('.close, #message-ok');
    if (botonesCerrar.length > 0) {
        botonesCerrar.forEach(boton => {
            boton.addEventListener('click', modales.cerrarModales);
        });
    }

    // Botón Volver en modal de materiales
    const materialsBackBtn = document.getElementById('materials-back-button');
    if (materialsBackBtn) {
        materialsBackBtn.addEventListener('click', () => {
            document.getElementById('materials-modal').style.display = 'none';
        });
    }
}

function configurarEventosGlobales(estado) {
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            modales.cerrarModales();
        }
    });

    // Teclas para el carrusel
    window.addEventListener('keydown', (e) => {
        const carruselVisible = document.getElementById('carousel-modal')?.style.display === 'block';
        if (!carruselVisible) return;
        
        switch (e.key) {
            case 'ArrowLeft':
                galeria.mostrarImagenAnteriorCarrusel(estado);
                break;
            case 'ArrowRight':
                galeria.mostrarImagenSiguienteCarrusel(estado);
                break;
            case 'Escape':
                document.getElementById('carousel-modal').style.display = 'none';
                break;
        }
    });

    // Detectar cambios de conexión
    window.addEventListener('online', () => {
        estado.esOffline = false;
        const offlineMessage = document.getElementById('offline-message');
        if (offlineMessage) offlineMessage.style.display = 'none';
    });

    window.addEventListener('offline', () => {
        estado.esOffline = true;
        const offlineMessage = document.getElementById('offline-message');
        if (offlineMessage) offlineMessage.style.display = 'block';
    });
}
// ============= FIN DE eventos.js =============