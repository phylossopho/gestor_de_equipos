// scripts/materiales.js
import * as modales from './modales.js';
import { agregarEquipoSimulado } from './arte.js';
import { reiniciarSelectorBase } from './baseLogic.js'; // Importación añadida

export function construirMapaMaterialAEquipo(estado) {
    try {
        estado.mapaMaterialAEquipo = {};

        if (!estado.materialesData) {
            console.warn('Datos de materiales no disponibles');
            return;
        }

        for (const [clase, equiposData] of Object.entries(estado.materialesData)) {
            if (clase === "Lord y Noble Lord") {
                for (const mat of equiposData.common) {
                    const key = `${clase}:${mat}`;
                    estado.mapaMaterialAEquipo[key] = "common";
                }
            } else {
                for (const [equipo, materials] of Object.entries(equiposData)) {
                    for (const mat of materials) {
                        const key = `${clase}:${mat}`;
                        if (!estado.mapaMaterialAEquipo[key]) {
                            estado.mapaMaterialAEquipo[key] = equipo;
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error construyendo mapa material-equipo:', error);
        modales.mostrarMensaje('Error', 'Error al mapear materiales a equipos', 'error');
    }
}

export function inicializarAlmacenamientoMateriales(estado) {
    try {
        if (!estado.materialesData) {
            console.warn('Datos de materiales no disponibles para inicializar almacenamiento');
            return;
        }

        for (const clase in estado.materialesData) {
            const equiposIterar = (clase === "Lord y Noble Lord")
                ? ["common"]
                : Object.keys(estado.materialesData[clase]);

            for (const equipo of equiposIterar) {
                const materials = estado.materialesData[clase][equipo];
                for (const mat of materials) {
                    const storageKey = `${clase}:${mat}`;
                    if (!estado.almacenMateriales[storageKey]) {
                        estado.almacenMateriales[storageKey] = {
                            'dorado': '0',
                            'morado': '0',
                            'azul': '0',
                            'verde': '0',
                            'blanco': '0'
                        };
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error inicializando almacenamiento de materiales:', error);
        modales.mostrarMensaje('Error', 'Error al inicializar el almacenamiento de materiales', 'error');
    }
}

export function cargarMaterialesDesdeLocalStorage(estado) {
    try {
        const materialesGuardados = localStorage.getItem('almacenMateriales');
        if (materialesGuardados) {
            estado.almacenMateriales = JSON.parse(materialesGuardados);
            console.log('Materiales cargados desde localStorage');
            estado.cambiosPendientes = true;
        } else {
            console.log('No se encontraron materiales guardados en localStorage');
        }
    } catch (e) {
        console.error('Error al cargar materiales desde localStorage:', e);
        modales.mostrarMensaje('Error', 'Error al cargar materiales guardados', 'error');
    }
}

export function guardarMaterialesEnLocalStorage(estado) {
    try {
        localStorage.setItem('almacenMateriales', JSON.stringify(estado.almacenMateriales));
        console.log('Materiales guardados en localStorage');
        estado.cambiosPendientes = false;
    } catch (e) {
        console.error('Error al guardar materiales en localStorage:', e);
        modales.mostrarMensaje('Error', 'Error al guardar materiales', 'error');
    }
}

function material3Disponible(nivel) {
    return nivel !== "1";
}

function material4Disponible(nivel) {
    return parseInt(nivel) >= 3;
}

export function usarMateriales(estado) {
    try {
        let materialsInView = [];
        const clase = estado.claseActual;
        
        // Determinar la clase de almacenamiento basada en la clase actual
        const claseAlmacen = 
            (clase === "Campeón" || clase === "Planewalker") ? "Campeón y Planewalker" :
            (clase === "Lord" || clase === "Noble Lord") ? "Lord y Noble Lord" :
            clase;

        if (claseAlmacen === "Lord y Noble Lord") {
            if (estado.materialesData[claseAlmacen]?.common) {
                materialsInView = estado.materialesData[claseAlmacen].common;
            }
        } else {
            if (estado.materialesData[claseAlmacen]?.[estado.equipoActual]) {
                materialsInView = estado.materialesData[claseAlmacen][estado.equipoActual];
            }
        }

        if (!materialsInView || materialsInView.length < 4) {
            modales.mostrarMensaje("Error", "No se encontraron suficientes materiales para esta configuración", "error");
            return;
        }

        const faltantes = [];
        let cambiosAplicados = false;

        // Procesar cada material (solo los disponibles según nivel)
        for (let i = 0; i < materialsInView.length; i++) {
            const mat = materialsInView[i];
            const storageKey = `${claseAlmacen}:${mat}`;
            const colorObjetivo = estado.colorPorMaterialSeleccionado[storageKey];

            // Saltar materiales no disponibles por nivel
            if ((i === 2 && !material3Disponible(estado.nivelActual)) || 
                (i === 3 && !material4Disponible(estado.nivelActual))) {
                continue;
            }

            // Si no hay color seleccionado, saltar
            if (!colorObjetivo) {
                faltantes.push(`${mat} (no se seleccionó color)`);
                continue;
            }

            // Obtener cantidades actuales
            const originalCantidades = {};
            for (const c in estado.mapaColores) {
                originalCantidades[c] = parseInt(estado.almacenMateriales[storageKey]?.[c] || '0') || 0;
            }

            // Simular el uso
            if (!estado.simularUso) {
                modales.mostrarMensaje("Error", "Función de simulación no disponible", "error");
                return;
            }

            const resultado = estado.simularUso(originalCantidades, colorObjetivo);

            if (resultado.exito) {
                // Actualizar el almacén con los nuevos valores
                for (const c in resultado.stock) {
                    if (estado.almacenMateriales[storageKey]) {
                        estado.almacenMateriales[storageKey][c] = resultado.stock[c].toString();
                    }
                }
                cambiosAplicados = true;
            } else {
                faltantes.push(`${mat} (para ${colorObjetivo})`);
            }
        }

        // Manejar resultados
        if (faltantes.length > 0) {
            modales.mostrarMensaje("Materiales Insuficientes",
                `No se pudieron procesar:\n${faltantes.join('\n')}`, 'warning');
        }

        if (cambiosAplicados) {
            estado.cambiosPendientes = true;
            guardarMaterialesEnLocalStorage(estado);

            // Agregar a la lista de equipos simulados
            agregarEquipoSimulado({
                equipo: estado.equipoActual,
                clase: clase,
                nivel: estado.nivelActual,
                color: estado.colorActual,
                material1: materialsInView[0],
                material1Color: estado.colorPorMaterialSeleccionado[`${claseAlmacen}:${materialsInView[0]}`] || 'N/A',
                material2: materialsInView[1],
                material2Color: estado.colorPorMaterialSeleccionado[`${claseAlmacen}:${materialsInView[1]}`] || 'N/A',
                material3: material3Disponible(estado.nivelActual) ? materialsInView[2] : "N/A",
                material3Color: material3Disponible(estado.nivelActual) ? 
                    (estado.colorPorMaterialSeleccionado[`${claseAlmacen}:${materialsInView[2]}`] || 'N/A') : 'N/A',
                material4: material4Disponible(estado.nivelActual) ? materialsInView[3] : "N/A",
                material4Color: material4Disponible(estado.nivelActual) ? 
                    (estado.colorPorMaterialSeleccionado[`${claseAlmacen}:${materialsInView[3]}`] || 'N/A') : 'N/A',
                base: estado.colorBaseSeleccionado || 'N/A'
            });

            // REINICIAR SELECTORES DE MATERIALES Y BASE
            // Eliminar todas las selecciones de color para los materiales actuales
            materialsInView.forEach(mat => {
                const storageKey = `${claseAlmacen}:${mat}`;
                delete estado.colorPorMaterialSeleccionado[storageKey];
            });
            
            // Reiniciar selector base
            reiniciarSelectorBase(estado);

            modales.mostrarMensaje("Éxito", "Materiales procesados y equipo guardado en ARTE", 'success');
        } else if (faltantes.length === 0) {
            modales.mostrarMensaje("Sin cambios", "No se realizaron cambios en los materiales", 'info');
        }
    } catch (error) {
        console.error('Error en usarMateriales:', error);
        modales.mostrarMensaje('Error', 'Error inesperado al procesar materiales', 'error');
    }
}

export function abrirListaMateriales(estado) {
    try {
        const modal = document.getElementById('materials-modal');
        const tablaContenedor = document.getElementById('all-materials-table');
        if (!modal || !tablaContenedor) {
            modales.mostrarMensaje('Error', 'Elemento modal no encontrado', 'error');
            return;
        }
        
        tablaContenedor.innerHTML = '';
        
        const tableContainer = document.createElement('div');
        tableContainer.className = 'materials-table';
        
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Crear encabezados
        ['', 'Material', 'Dorado', 'Morado', 'Azul', 'Verde', 'Blanco'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        
        // Lista completa de 28 materiales
        const listaMateriales = [
            "Voluntad del emperador", 
            "Guardia del emperador", 
            "Alma del emperador", 
            "Aliento del emperador",
            "Quijada ácida", 
            "Oro talon",
            "Hoja de jade", 
            "Ámbar hierba", 
            "Carbonizado gnarl", 
            "Acero reforzado",
            "Pluma Stick", 
            "Extracto destilado", 
            "Razor diente de sierra", 
            "Piel de terciopelo", 
            "Crystal mystic", 
            "Tempest Stardust",
            "Maxilar", 
            "Garra", 
            "Hoja", 
            "Césped", 
            "Nudo", 
            "Acero", 
            "Pluma", 
            "Extraer",
            "Diente de sierra", 
            "Pelaje", 
            "Cristal", 
            "Stardust"
        ];

        // Crear filas para todos los materiales
        listaMateriales.forEach(material => {
            // Buscar la clave de almacenamiento para este material
            let claveEncontrada = null;
            for (const clave in estado.almacenMateriales) {
                if (clave.endsWith(`:${material}`)) {
                    claveEncontrada = clave;
                    break;
                }
            }

            // Si no se encuentra, crear una nueva entrada
            if (!claveEncontrada) {
                // Determinar la clase apropiada para este material
                let claseAsignada = "Normal";
                if (material.includes("emperador")) {
                    claseAsignada = "Lord y Noble Lord";
                } else if (material.includes("ácida") || material.includes("Stardust")) {
                    claseAsignada = "Campeón y Planewalker";
                }
                
                claveEncontrada = `${claseAsignada}:${material}`;
                
                if (!estado.almacenMateriales[claveEncontrada]) {
                    estado.almacenMateriales[claveEncontrada] = {
                        dorado: '0', morado: '0', azul: '0', verde: '0', blanco: '0'
                    };
                }
            }

            const fila = document.createElement('tr');
            
            // Celda de imagen
            const celdaImagen = document.createElement('td');
            const imagen = document.createElement('img');
            const nombreImagen = material.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            imagen.src = `images/${nombreImagen}.png`;
            imagen.className = 'material-img';
            imagen.onerror = () => {
                imagen.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = material.substring(0, 3);
                span.className = 'material-initials';
                celdaImagen.appendChild(span);
            };
            celdaImagen.appendChild(imagen);
            fila.appendChild(celdaImagen);

            // Celda de nombre SOLO CON EL MATERIAL (sin clase)
            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = material;
            fila.appendChild(celdaNombre);

            // Celdas de colores
            ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach(color => {
                const celda = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'number';
                input.min = '0';
                input.value = estado.almacenMateriales[claveEncontrada]?.[color] || '0';
                input.className = 'color-input';
                input.setAttribute('data-color', color);

                input.addEventListener('change', (e) => {
                    const valor = e.target.value;
                    // Validar que sea número no negativo
                    if (/^\d+$/.test(valor)) {
                        if (!estado.almacenMateriales[claveEncontrada]) {
                            estado.almacenMateriales[claveEncontrada] = {
                                dorado: '0', morado: '0', azul: '0', verde: '0', blanco: '0'
                            };
                        }
                        estado.almacenMateriales[claveEncontrada][color] = valor;
                        estado.cambiosPendientes = true;
                        guardarMaterialesEnLocalStorage(estado);
                    } else {
                        e.target.value = estado.almacenMateriales[claveEncontrada][color] || '0';
                    }
                });
                
                celda.appendChild(input);
                fila.appendChild(celda);
            });

            tbody.appendChild(fila);
        });

        table.appendChild(tbody);
        tableContainer.appendChild(table);
        tablaContenedor.appendChild(tableContainer);
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error en abrirListaMateriales:', error);
        modales.mostrarMensaje('Error', 'Error al abrir la lista de materiales', 'error');
    }
}