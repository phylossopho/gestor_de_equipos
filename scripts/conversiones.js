// scripts/conversiones.js
import * as modales from './modales.js';

// Función para actualizar una tabla de conversión específica
export function actualizarTablaConversion(estado, tipoConversion) {
    try {
        const contenedorTabla = document.getElementById(`${tipoConversion}-table`);
        if (!contenedorTabla) {
            console.warn(`Contenedor no encontrado para: ${tipoConversion}`);
            return;
        }

        contenedorTabla.innerHTML = '';

        // Crear tabla
        const tabla = document.createElement('table');
        
        // Encabezados
        const encabezados = ["", "Material", "Dorado", "Morado", "Azul", "Verde", "Blanco"];
        const filaEncabezados = document.createElement('tr');

        encabezados.forEach(encabezado => {
            const th = document.createElement('th');
            th.textContent = encabezado;
            filaEncabezados.appendChild(th);
        });

        tabla.appendChild(filaEncabezados);

        // Obtener materiales según la selección actual
        let materiales = [];
        const clase = estado.claseActual;
        
        // Determinar la clase de almacenamiento
        const claseAlmacen = 
            (clase === "Campeón" || clase === "Planewalker") ? "Campeón y Planewalker" :
            (clase === "Lord" || clase === "Noble Lord") ? "Lord y Noble Lord" :
            clase;

        // Obtener materiales
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
            contenedorTabla.innerHTML = '<p>No hay suficientes materiales para mostrar</p>';
            return;
        }

        // Reordenar materiales: material 3, material 1, material 2, material 4
        materiales = [materiales[2], materiales[0], materiales[1], materiales[3]];

        // Crear filas para cada material
        materiales.forEach(material => {
            const claveAlmacen = `${claseAlmacen}:${material}`;
            const fila = document.createElement('tr');

            // Celda de imagen
            const celdaImagen = document.createElement('td');
            const imagen = document.createElement('img');
            const nombreImagen = material.toLowerCase().replace(/\s+/g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            imagen.src = `images/${nombreImagen}.png`;
            imagen.style.maxWidth = '30px';
            imagen.style.maxHeight = '30px';
            imagen.onerror = function() {
                this.style.display = 'none';
                const span = document.createElement('span');
                span.textContent = material.substring(0, 2);
                celdaImagen.appendChild(span);
            };
            celdaImagen.appendChild(imagen);
            fila.appendChild(celdaImagen);

            // Celda de nombre del material
            const celdaNombre = document.createElement('td');
            celdaNombre.textContent = material;
            fila.appendChild(celdaNombre);

            // Crear una copia del almacenamiento para esta conversión
            const almacenOriginal = estado.almacenMateriales[claveAlmacen] || {
                'dorado': '0',
                'morado': '0',
                'azul': '0',
                'verde': '0',
                'blanco': '0'
            };
            
            const almacenConvertido = obtenerAlmacenConvertido(almacenOriginal, tipoConversion);

            // Celdas de colores
            ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach(color => {
                const celdaColor = document.createElement('td');
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'color-input';
                input.setAttribute('data-color', color);
                input.value = almacenConvertido[color] || '0';
                input.readOnly = true;
                celdaColor.appendChild(input);
                fila.appendChild(celdaColor);
            });

            tabla.appendChild(fila);
        });

        contenedorTabla.appendChild(tabla);
    } catch (error) {
        console.error(`Error actualizando tabla de conversión ${tipoConversion}:`, error);
        modales.mostrarMensaje('Error', `Error al generar la tabla de conversión: ${tipoConversion}`, 'error');
    }
}

// Obtener almacenamiento convertido según el tipo de conversión
function obtenerAlmacenConvertido(almacenOriginal, tipoConversion) {
    try {
        // Convertir valores a números
        const valoresActuales = {
            'dorado': parseInt(almacenOriginal.dorado || '0') || 0,
            'morado': parseInt(almacenOriginal.morado || '0') || 0,
            'azul': parseInt(almacenOriginal.azul || '0') || 0,
            'verde': parseInt(almacenOriginal.verde || '0') || 0,
            'blanco': parseInt(almacenOriginal.blanco || '0') || 0
        };

        // Aplicar la conversión adecuada
        switch (tipoConversion) {
            case 'conversion1':
                return convertirMateriales(valoresActuales, 'blanco', 'verde', 4);

            case 'conversion2':
                return convertirMateriales(
                    convertirMateriales(valoresActuales, 'blanco', 'verde', 4),
                    'verde', 'azul', 4
                );

            case 'conversion3':
                return convertirMateriales(
                    convertirMateriales(
                        convertirMateriales(valoresActuales, 'blanco', 'verde', 4),
                        'verde', 'azul', 4
                    ),
                    'azul', 'morado', 4
                );

            case 'conversionfinal':
                return convertirMateriales(
                    convertirMateriales(
                        convertirMateriales(
                            convertirMateriales(valoresActuales, 'blanco', 'verde', 4),
                            'verde', 'azul', 4
                        ),
                        'azul', 'morado', 4
                    ),
                    'morado', 'dorado', 4
                );

            default:
                return valoresActuales;
        }
    } catch (error) {
        console.error('Error obteniendo almacen convertido:', error);
        return almacenOriginal;
    }
}

// Función auxiliar para convertir materiales
function convertirMateriales(valores, colorOrigen, colorDestino, ratio) {
    try {
        // Crear una copia profunda de los valores
        const resultado = JSON.parse(JSON.stringify(valores));

        // Calcular cuántos materiales se pueden convertir
        const cantidadConvertible = Math.floor(resultado[colorOrigen] / ratio);

        // Realizar la conversión si es posible
        if (cantidadConvertible > 0) {
            resultado[colorOrigen] -= cantidadConvertible * ratio;
            resultado[colorDestino] = (resultado[colorDestino] || 0) + cantidadConvertible;
        }

        // Asegurar que todos los colores existan en el resultado
        ['dorado', 'morado', 'azul', 'verde', 'blanco'].forEach(color => {
            if (resultado[color] === undefined) {
                resultado[color] = valores[color] || 0;
            }
        });

        return resultado;
    } catch (error) {
        console.error('Error en conversión de materiales:', error);
        return valores;
    }
}