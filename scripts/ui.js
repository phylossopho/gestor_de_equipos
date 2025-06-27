// scripts/ui.js
import * as conversiones from './conversiones.js';
import { guardarMaterialesEnLocalStorage } from './materiales.js';
import { crearBaseSelector, actualizarEstadoBase } from './baseLogic.js';
import { generarTablaArte } from './arte.js';
import * as modales from './modales.js';
import { restriccionesClase, mapaColores } from './datos.js'; // Importamos las restricciones

export function actualizarImagenEquipo(estado) {
    const elementoImagen = document.getElementById('equipment-img');
    if (elementoImagen) {
        try {
            elementoImagen.src = `images/${estado.equipoActual.toLowerCase()}.png`;
            elementoImagen.onerror = () => {
                elementoImagen.style.display = 'none';
                console.warn(`Imagen no encontrada para equipo: ${estado.equipoActual}`);
            };
            elementoImagen.style.display = 'block';
        } catch (error) {
            console.error('Error actualizando imagen de equipo:', error);
        }
    }
}

export function actualizarTabla(estado) {
    const contenedorTabla = document.getElementById('materials-table');
    if (!contenedorTabla) return;
    contenedorTabla.innerHTML = '';

    try {
        const tabla = document.createElement('table');
        const encabezados = ["", "Material", "Dorado", "Morado", "Azul", "Verde", "Blanco"];
        const filaEncabezados = document.createElement('tr');

        encabezados.forEach(encabezado => {
            const th = document.createElement('th');
            th.textContent = encabezado;
            filaEncabezados.appendChild(th);
        });

        tabla.appendChild(filaEncabezados);

        let materiales = [];
        const clase = estado.claseActual;
        
        // Determinar la clase de almacenamiento basada en la clase actual
        const claseAlmacen = 
            (clase === "Campeón" || clase === "Planewalker") ? "Campeón y Planewalker" :
            (clase === "Lord" || clase === "Noble Lord") ? "Lord y Noble Lord" :
            clase;

        if (claseAlmacen === "Lord y Noble Lord") {
            if (estado.materialesData[claseAlmacen]?.common) {
                materiales = estado.materialesData[claseAlmacen].common;
            }
        } else {
            if (estado.materialesData[claseAlmacen]?.[estado.equipoActual]) {
                materiales = estado.materialesData[claseAlmacen][estado.equipoActual];
            }
        }

        if (!materiales || materiales.length === 0) {
            contenedorTabla.innerHTML = '<p>No se encontraron materiales para esta configuración</p>';
            return;
        }

        // NUEVO ORDEN: Material 3, Material 1, Material 2, Material 4
        // Crear nuevo arreglo con el orden deseado: material3, material1, material2, material4
        const materialesOrdenados = [];
        const indicesOriginales = [];
        
        if (materiales.length > 2) {
            materialesOrdenados.push(materiales[2]); // Material 3
            indicesOriginales.push(2); // Índice original: 2
        }
        
        if (materiales.length > 0) {
            materialesOrdenados.push(materiales[0]); // Material 1
            indicesOriginales.push(0); // Índice original: 0
        }
        
        if (materiales.length > 1) {
            materialesOrdenados.push(materiales[1]); // Material 2
            indicesOriginales.push(1); // Índice original: 1
        }
        
        if (materiales.length > 3) {
            materialesOrdenados.push(materiales[3]); // Material 4
            indicesOriginales.push(3); // Índice original: 3
        }

        // Iterar sobre los materiales en el nuevo orden
        materialesOrdenados.forEach((material, newIndex) => {
            const idxOriginal = indicesOriginales[newIndex];
            const claveAlmacen = `${claseAlmacen}:${material}`;
            const fila = document.createElement('tr');

            // Celda de imagen
            const celdaImagen = document.createElement('td');
            const imagen = document.createElement('img');
            const nombreImagen = material.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            imagen.src = `images/${nombreImagen}.png`;
            imagen.style.width = '30px';
            imagen.style.height = '30px';
            imagen.onerror = () => {
                imagen.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = material.substring(0, 2);
                celdaImagen.appendChild(span);
            };
            celdaImagen.appendChild(imagen);
            fila.appendChild(celdaImagen);

            // Celda de nombre
            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = material;
            fila.appendChild(celdaNombre);

            // Celdas de colores
            ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach(color => {
                const celdaColor = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'color-input';
                input.dataset.color = color;
                
                // Valor inicial
                input.value = estado.almacenMateriales[claveAlmacen]?.[color] || '0';
                
                // Deshabilitar según nivel - usar índice ORIGINAL
                const deshabilitado = (idxOriginal === 2 && estado.nivelActual === "1") || 
                                    (idxOriginal === 3 && (estado.nivelActual === "1" || estado.nivelActual === "2"));
                
                if (deshabilitado) {
                    input.disabled = true;
                    input.style.backgroundColor = '#f0f0f0';
                } else {
                    input.addEventListener('input', (e) => {
                        if (/^\d*$/.test(e.target.value)) {
                            if (!estado.almacenMateriales[claveAlmacen]) {
                                estado.almacenMateriales[claveAlmacen] = {};
                            }
                            estado.almacenMateriales[claveAlmacen][color] = e.target.value;
                            estado.cambiosPendientes = true;
                            guardarMaterialesEnLocalStorage(estado);
                        } else {
                            e.target.value = estado.almacenMateriales[claveAlmacen][color] || '0';
                        }
                    });
                }

                celdaColor.appendChild(input);
                fila.appendChild(celdaColor);
            });

            tabla.appendChild(fila);
        });

        contenedorTabla.appendChild(tabla);
    } catch (error) {
        console.error('Error actualizando tabla:', error);
        contenedorTabla.innerHTML = '<p>Error al cargar los materiales</p>';
    }
}

export function actualizarSelectoresMaterialesInferiores(estado) {
    const seccionInferior = document.getElementById('bottom-section');
    if (!seccionInferior) return;
    seccionInferior.innerHTML = '';

    try {
        let materiales = [];
        const clase = estado.claseActual;
        
        // Determinar la clase de almacenamiento basada en la clase actual
        const claseAlmacen = 
            (clase === "Campeón" || clase === "Planewalker") ? "Campeón y Planewalker" :
            (clase === "Lord" || clase === "Noble Lord") ? "Lord y Noble Lord" :
            clase;

        if (claseAlmacen === "Lord y Noble Lord") {
            if (estado.materialesData[claseAlmacen]?.common) {
                materiales = estado.materialesData[claseAlmacen].common;
            }
        } else {
            if (estado.materialesData[claseAlmacen]?.[estado.equipoActual]) {
                materiales = estado.materialesData[claseAlmacen][estado.equipoActual];
            }
        }

        if (!materiales || materiales.length < 4) {
            seccionInferior.innerHTML = '<p>No hay suficientes materiales para mostrar</p>';
            return;
        }

        // Crear selectores en el orden correcto: material3, material1, base, material2, material4
        crearMaterialSelector(estado, seccionInferior, materiales[2], 2, claseAlmacen);
        crearMaterialSelector(estado, seccionInferior, materiales[0], 0, claseAlmacen);
        crearBaseSelector(estado, seccionInferior);
        crearMaterialSelector(estado, seccionInferior, materiales[1], 1, claseAlmacen);
        crearMaterialSelector(estado, seccionInferior, materiales[3], 3, claseAlmacen);
    } catch (error) {
        console.error('Error actualizando selectores inferiores:', error);
        seccionInferior.innerHTML = '<p>Error al cargar los selectores</p>';
    }
}

function crearMaterialSelector(estado, contenedor, material, indice, claseAlmacen) {
    try {
        const claveAlmacen = `${claseAlmacen}:${material}`;
        const colorActual = estado.colorPorMaterialSeleccionado[claveAlmacen];
        let colorFondo = estado.colorNoSeleccionado;

        const material3Restringido = indice === 2 && estado.nivelActual === "1";
        const material4Restringido = indice === 3 && (estado.nivelActual === "1" || estado.nivelActual === "2");

        const selectorMaterial = document.createElement('div');
        selectorMaterial.className = 'material-selector';
        selectorMaterial.style.backgroundColor = colorFondo;

        if (material3Restringido || material4Restringido) {
            const deniedImage = document.createElement('img');
            deniedImage.src = 'images/denied.png';
            deniedImage.alt = 'Acción no permitida';
            deniedImage.style.maxWidth = '100%';
            deniedImage.style.height = '100px';
            deniedImage.style.objectFit = 'contain';
            selectorMaterial.appendChild(deniedImage);
            
            // Mensaje de ayuda
            const mensaje = document.createElement('div');
            mensaje.textContent = 'No disponible en este nivel';
            mensaje.style.fontSize = '0.8em';
            mensaje.style.textAlign = 'center';
            mensaje.style.marginTop = '5px';
            selectorMaterial.appendChild(mensaje);
        } else {
            const imagen = document.createElement('img');
            const nombreImagen = material.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            imagen.src = `images/${nombreImagen}.png`;
            imagen.alt = material;
            imagen.style.maxWidth = '100%';
            imagen.style.height = '100px';
            imagen.style.objectFit = 'contain';
            imagen.onerror = () => {
                imagen.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = material;
                selectorMaterial.appendChild(span);
            };
            selectorMaterial.appendChild(imagen);

            const selector = document.createElement('select');
            selector.innerHTML = `
                <option value="">-</option>
                <option value="blanco" ${colorActual === 'blanco' ? 'selected' : ''}>Blanco</option>
                <option value="verde" ${colorActual === 'verde' ? 'selected' : ''}>Verde</option>
                <option value="azul" ${colorActual === 'azul' ? 'selected' : ''}>Azul</option>
                <option value="morado" ${colorActual === 'morado' ? 'selected' : ''}>Morado</option>
                <option value="dorado" ${colorActual === 'dorado' ? 'selected' : ''}>Dorado</option>
            `;

            selector.addEventListener('change', (e) => {
                previsualizarUso(estado, claveAlmacen, e.target.value, selectorMaterial);
            });

            selectorMaterial.appendChild(selector);
        }

        contenedor.appendChild(selectorMaterial);
    } catch (error) {
        console.error('Error creando selector de material:', error);
    }
}

function previsualizarUso(estado, claveAlmacen, colorObjetivo, selectorMaterial) {
    try {
        // MANEJO DE SELECTOR VACÍO: REINICIO VISUAL
        if (!colorObjetivo) {
            selectorMaterial.style.backgroundColor = estado.colorNoSeleccionado;
            delete estado.colorPorMaterialSeleccionado[claveAlmacen];
            return;
        }

        const cantidadesActuales = {};
        for (const c in estado.mapaColores) {
            cantidadesActuales[c] = parseInt(estado.almacenMateriales[claveAlmacen]?.[c] || '0') || 0;
        }

        if (!estado.simularUso) {
            console.error('Función simularUso no definida en estado');
            modales.mostrarMensaje('Error', 'Función de simulación no disponible', 'error');
            return;
        }

        const resultado = estado.simularUso(cantidadesActuales, colorObjetivo);

        if (resultado && resultado.exito) {
            selectorMaterial.style.backgroundColor = estado.mapaColores[colorObjetivo];
            estado.colorPorMaterialSeleccionado[claveAlmacen] = colorObjetivo;
        } else {
            selectorMaterial.style.backgroundColor = estado.colorNoSeleccionado;
            const selector = selectorMaterial.querySelector('select');
            if (selector) selector.value = '';
            delete estado.colorPorMaterialSeleccionado[claveAlmacen];
            
            if (resultado && !resultado.exito) {
                modales.mostrarMensaje('Materiales insuficientes', 
                    `No tienes suficientes materiales para crear ${colorObjetivo}`, 'warning');
            }
        }
    } catch (error) {
        console.error('Error en previsualización de uso:', error);
        modales.mostrarMensaje('Error', 'Error al simular el uso de materiales', 'error');
    }
}

// Función para aplicar restricciones específicas para las clases especiales
function aplicarRestriccionesClase(estado) {
    const levelSelect = document.getElementById('level-select');
    const colorSelect = document.getElementById('color-select');
    const baseSelector = document.querySelector('.base-selector');

    // Clases que solo permiten nivel 5
    const clasesNivel5 = ["Planewalker", "Lord", "Noble Lord"];
    const clasesColoresLimitados = ["Campeón", "Planewalker", "Lord", "Noble Lord"];
    const coloresPermitidosLimitados = ["azul", "morado", "dorado"];
    const coloresPermitidosNormal = ["blanco", "verde", "azul", "morado", "dorado"];

    if (estado.claseActual === "Campeón") {
        // Fijar nivel a 4
        if (levelSelect) {
            levelSelect.value = "4";
            estado.nivelActual = "4";
            Array.from(levelSelect.options).forEach(option => {
                option.disabled = option.value !== "4";
            });
        }
        // Mostrar solo azul, morado y dorado
        if (colorSelect) {
            Array.from(colorSelect.options).forEach(option => {
                if (!coloresPermitidosLimitados.includes(option.value)) {
                    option.style.display = 'none';
                } else {
                    option.style.display = 'block';
                }
            });
            if (!coloresPermitidosLimitados.includes(estado.colorActual)) {
                estado.colorActual = "dorado";
                colorSelect.value = "dorado";
            }
        }
        // Actualizar el selector base para mostrar el equipo normal de nivel 4
        if (baseSelector) {
            const title = baseSelector.querySelector('.base-title');
            if (title) {
                title.textContent = "Equipo normal de nivel 4";
            }
            let equipoImg = baseSelector.querySelector('.base-equipo-img');
            if (!equipoImg) {
                const dynamicContainer = baseSelector.querySelector('.base-dynamic-content');
                if (dynamicContainer) {
                    equipoImg = document.createElement('img');
                    equipoImg.className = 'base-equipo-img';
                    equipoImg.src = `images/${estado.equipoActual.toLowerCase()}.png`;
                    equipoImg.alt = estado.equipoActual;
                    equipoImg.style.maxWidth = '50px';
                    equipoImg.style.maxHeight = '50px';
                    equipoImg.style.marginBottom = '10px';
                    equipoImg.onerror = () => {
                        equipoImg.style.display = 'none';
                    };
                    dynamicContainer.insertBefore(equipoImg, dynamicContainer.firstChild);
                }
            }
        }
    } else if (clasesNivel5.includes(estado.claseActual)) {
        // Fijar nivel a 5
        if (levelSelect) {
            levelSelect.value = "5";
            estado.nivelActual = "5";
            Array.from(levelSelect.options).forEach(option => {
                option.disabled = option.value !== "5";
            });
        }
        // Mostrar solo azul, morado y dorado
        if (colorSelect) {
            Array.from(colorSelect.options).forEach(option => {
                if (!coloresPermitidosLimitados.includes(option.value)) {
                    option.style.display = 'none';
                } else {
                    option.style.display = 'block';
                }
            });
            if (!coloresPermitidosLimitados.includes(estado.colorActual)) {
                estado.colorActual = "dorado";
                colorSelect.value = "dorado";
            }
        }
        // Actualizar el selector base para mostrar la imagen y el texto correspondiente
        if (baseSelector) {
            const title = baseSelector.querySelector('.base-title');
            let texto = '';
            if (estado.claseActual === "Planewalker") {
                texto = "Equipo normal de nivel 5";
            } else if (estado.claseActual === "Lord") {
                texto = "Equipo de nivel 5 o menor";
            } else if (estado.claseActual === "Noble Lord") {
                texto = "Equipo Lord de nivel 5";
            }
            if (title) {
                title.textContent = texto;
            }
            let equipoImg = baseSelector.querySelector('.base-equipo-img');
            if (!equipoImg) {
                const dynamicContainer = baseSelector.querySelector('.base-dynamic-content');
                if (dynamicContainer) {
                    equipoImg = document.createElement('img');
                    equipoImg.className = 'base-equipo-img';
                    equipoImg.src = `images/${estado.equipoActual.toLowerCase()}.png`;
                    equipoImg.alt = estado.equipoActual;
                    equipoImg.style.maxWidth = '50px';
                    equipoImg.style.maxHeight = '50px';
                    equipoImg.style.marginBottom = '10px';
                    equipoImg.onerror = () => {
                        equipoImg.style.display = 'none';
                    };
                    dynamicContainer.insertBefore(equipoImg, dynamicContainer.firstChild);
                }
            }
        }
    } else {
        // Restaurar los controles si es clase Normal
        if (levelSelect) {
            Array.from(levelSelect.options).forEach(option => {
                option.disabled = false;
            });
        }
        if (colorSelect) {
            Array.from(colorSelect.options).forEach(option => {
                if (!coloresPermitidosNormal.includes(option.value)) {
                    option.style.display = 'none';
                } else {
                    option.style.display = 'block';
                }
            });
            if (!coloresPermitidosNormal.includes(estado.colorActual)) {
                estado.colorActual = "blanco";
                colorSelect.value = "blanco";
            }
        }
        if (baseSelector) {
            const title = baseSelector.querySelector('.base-title');
            if (title) {
                // Para clase Normal, mostrar texto según el nivel
                if (estado.claseActual === "Normal") {
                    if (estado.nivelActual === "1") {
                        title.textContent = "Equipo de nivel 1";
                    } else {
                        title.textContent = `Equipo de nivel ${estado.nivelActual} o menor`;
                    }
                } else {
                    title.textContent = "Base";
                }
            }
            const equipoImg = baseSelector.querySelector('.base-equipo-img');
            if (equipoImg) {
                equipoImg.remove();
            }
        }
    }
}

export function actualizarUI(estado) {
    try {
        // Aplicar restricciones para la clase especial
        aplicarRestriccionesClase(estado);

        actualizarImagenEquipo(estado);
        actualizarTabla(estado);
        actualizarSelectoresMaterialesInferiores(estado);
        actualizarEstadoBase(estado);

        const pestañaActiva = document.querySelector('.tab-button.active');
        const idPestaña = pestañaActiva ? pestañaActiva.dataset.tab : 'materials';
        const esLeyenda = idPestaña === 'conversionlegend';
        const esArte = idPestaña === 'arte';

        const topSection = document.querySelector('.top-section');
        if (topSection) topSection.style.display = (esLeyenda || esArte) ? 'none' : 'flex';

        const bottomSection = document.getElementById('bottom-section');
        if (bottomSection) bottomSection.style.display = (esLeyenda || esArte) ? 'none' : 'flex';

        const useButton = document.getElementById('use-materials');
        if (useButton) {
            // CAMBIO: Ocultar en ARTE y en Leyenda de Conversión
            useButton.style.display = (esArte || esLeyenda) ? 'none' : 'block';
        }

        const galleryButton = document.getElementById('gallery-button');
        if (galleryButton) galleryButton.style.display = esLeyenda ? 'none' : 'flex';

        if (idPestaña === 'arte') {
            generarTablaArte();
        } else if (idPestaña !== 'materials' && idPestaña !== 'conversionlegend') {
            conversiones.actualizarTablaConversion(estado, idPestaña);
        }
    } catch (error) {
        console.error('Error en actualización de UI:', error);
        modales.mostrarMensaje('Error', 'Se produjo un error al actualizar la interfaz', 'error');
    }
}

// === CAMBIO DE FONDO SEGÚN COLOR DE EQUIPO ===
function pastelizarColor(hex, factor = 0.7) {
    // Si es un nombre de color, convertir a hex
    const coloresNombres = {
        'white': '#FFFFFF',
        'blanco': '#FFFFFF',
        'verde': '#90EE90',
        'azul': '#ADD8E6',
        'morado': '#DDA0DD',
        'dorado': '#FFD700'
    };
    if (hex in coloresNombres) hex = coloresNombres[hex];
    if (!hex.startsWith('#')) return hex;
    // Convertir a RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    // Mezclar con blanco
    r = Math.round(r + (255 - r) * factor);
    g = Math.round(g + (255 - g) * factor);
    b = Math.round(b + (255 - b) * factor);
    return `rgb(${r},${g},${b})`;
}

function aplicarFondoPorColorEquipo() {
    const colorSelect = document.getElementById('color-select');
    if (!colorSelect) return;
    const color = colorSelect.value;
    const colorBase = mapaColores[color] || '#FFFFFF';
    const pastel = pastelizarColor(colorBase, 0.7);
    // Aplicar al body o al contenedor principal
    document.body.style.background = pastel;
}

document.addEventListener('DOMContentLoaded', () => {
    const colorSelect = document.getElementById('color-select');
    if (colorSelect) {
        colorSelect.addEventListener('change', aplicarFondoPorColorEquipo);
        aplicarFondoPorColorEquipo(); // Inicial
    }
});