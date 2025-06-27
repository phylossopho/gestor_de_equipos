// scripts/arte.js - INICIO
import { mapaColores } from './datos.js';

// Array para almacenar los equipos simulados
let equiposSimulados = JSON.parse(localStorage.getItem('equiposSimulados')) || [];

export function agregarEquipoSimulado(equipo) {
    equiposSimulados.unshift(equipo); // Agregar al inicio
    guardarEquiposEnLocalStorage();
}

export function generarTablaArte() {
    const arteTable = document.getElementById('arte-table');
    if (!arteTable) return;

    arteTable.innerHTML = '';

    if (equiposSimulados.length === 0) {
        arteTable.innerHTML = '<p>No hay equipos simulados aún.</p>';
        return;
    }

    const table = document.createElement('table');

    // Encabezados con 10 columnas (agregamos Eliminar)
    const encabezados = [
        "Icono", "Tipo", "Clase", "Nivel",
        "Material 3", "Material 1", "Base",
        "Material 2", "Material 4", "Eliminar"
    ];
    const filaEncabezados = document.createElement('tr');

    encabezados.forEach(encabezado => {
        const th = document.createElement('th');
        th.textContent = encabezado;
        filaEncabezados.appendChild(th);
    });
    table.appendChild(filaEncabezados);

    // Filas con datos - ORDEN INVERSO (más antiguo primero)
    [...equiposSimulados].reverse().forEach((equipo, idx, arr) => {
        const fila = document.createElement('tr');
        // 1. Imagen del equipo con fondo de color
        const celdaEquipoImg = document.createElement('td');
        if (equipo.color && mapaColores[equipo.color]) {
            celdaEquipoImg.style.backgroundColor = mapaColores[equipo.color];
        }
        const imgEquipo = document.createElement('img');
        imgEquipo.src = `images/${equipo.equipo.toLowerCase()}.png`;
        imgEquipo.alt = equipo.equipo;
        imgEquipo.style.width = '24px';
        imgEquipo.style.height = '24px';
        imgEquipo.style.display = 'block';
        imgEquipo.style.margin = '0 auto';
        imgEquipo.onerror = function() {
            this.style.display = 'none';
            const span = document.createElement('span');
            span.textContent = equipo.equipo;
            celdaEquipoImg.appendChild(span);
        };
        celdaEquipoImg.appendChild(imgEquipo);
        fila.appendChild(celdaEquipoImg);

        // 2. Tipo de equipo (texto)
        const celdaTipo = document.createElement('td');
        celdaTipo.textContent = equipo.equipo;
        fila.appendChild(celdaTipo);

        // 3. Clase
        const celdaClase = document.createElement('td');
        celdaClase.textContent = equipo.clase;
        fila.appendChild(celdaClase);

        // 4. Nivel
        const celdaNivel = document.createElement('td');
        celdaNivel.textContent = equipo.nivel;
        fila.appendChild(celdaNivel);

        // Función para crear celdas de material
        const crearCeldaMaterial = (material, color) => {
            const celda = document.createElement('td');
            if (material && material !== 'N/A') {
                if (color && mapaColores[color]) {
                    celda.style.backgroundColor = mapaColores[color];
                }
                const img = document.createElement('img');
                const nombreImagen = material.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                img.src = `images/${nombreImagen}.png`;
                img.alt = material;
                img.style.width = '24px';
                img.style.height = '24px';
                img.style.display = 'block';
                img.style.margin = '0 auto';
                img.onerror = function() {
                    this.style.display = 'none';
                    const span = document.createElement('span');
                    span.textContent = material;
                    celda.appendChild(span);
                };
                celda.appendChild(img);
            } else {
                celda.innerHTML = '&nbsp;';
            }
            return celda;
        };

        // 5. Material 3
        fila.appendChild(crearCeldaMaterial(equipo.material3, equipo.material3Color));
        // 6. Material 1
        fila.appendChild(crearCeldaMaterial(equipo.material1, equipo.material1Color));
        // 7. Base
        const celdaBase = document.createElement('td');
        if (equipo.base && equipo.base !== 'N/A') {
            if (mapaColores[equipo.base]) {
                celdaBase.style.backgroundColor = mapaColores[equipo.base];
            }
            const nombreBase = equipo.base.toLowerCase();
            const imgBase = document.createElement('img');
            imgBase.src = `images/${nombreBase}.png`;
            imgBase.alt = equipo.base;
            imgBase.style.width = '24px';
            imgBase.style.height = '24px';
            imgBase.style.display = 'block';
            imgBase.style.margin = '0 auto';
            imgBase.onerror = function() {
                this.style.display = 'none';
                celdaBase.textContent = equipo.base;
            };
            celdaBase.appendChild(imgBase);
        } else {
            celdaBase.textContent = 'N/A';
        }
        fila.appendChild(celdaBase);
        // 8. Material 2
        fila.appendChild(crearCeldaMaterial(equipo.material2, equipo.material2Color));
        // 9. Material 4
        fila.appendChild(crearCeldaMaterial(equipo.material4, equipo.material4Color));

        // 10. Columna Eliminar
        const celdaEliminar = document.createElement('td');
        celdaEliminar.style.textAlign = 'center';
        const btnEliminar = document.createElement('img');
        btnEliminar.src = 'images/borrarsim.png';
        btnEliminar.alt = 'Eliminar';
        btnEliminar.style.width = '24px';
        btnEliminar.style.height = '24px';
        btnEliminar.style.cursor = 'pointer';
        btnEliminar.style.display = 'block';
        btnEliminar.style.margin = '0 auto';
        // El índice real en equiposSimulados (ya que se invierte)
        const realIdx = equiposSimulados.length - 1 - idx;
        btnEliminar.addEventListener('click', () => {
            equiposSimulados.splice(realIdx, 1);
            guardarEquiposEnLocalStorage();
            generarTablaArte();
        });
        celdaEliminar.appendChild(btnEliminar);
        fila.appendChild(celdaEliminar);

        table.appendChild(fila);
    });

    arteTable.appendChild(table);
}

// Guardar en localStorage
function guardarEquiposEnLocalStorage() {
    try {
        localStorage.setItem('equiposSimulados', JSON.stringify(equiposSimulados));
    } catch (e) {
        console.error('Error guardando equipos:', e);
    }
}

// Cargar desde localStorage
export function cargarEquiposDesdeLocalStorage() {
    try {
        const guardados = localStorage.getItem('equiposSimulados');
        if (guardados) {
            // Limpiar el array actual y cargar los guardados
            equiposSimulados.length = 0;
            equiposSimulados.push(...JSON.parse(guardados));
        }
    } catch (e) {
        console.error('Error cargando equipos:', e);
    }
}
// scripts/arte.js - FIN