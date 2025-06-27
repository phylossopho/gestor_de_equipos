// scripts/csv.js
import * as modales from './modales.js';
import { guardarMaterialesEnLocalStorage } from './materiales.js';

export function exportarCSV(estado) {
    try {
        let csvContent = "Clase,Equipo,Material,Dorado,Morado,Azul,Verde,Blanco\n";

        for (const [clave, valores] of Object.entries(estado.almacenMateriales)) {
            const [clase, material] = clave.split(':');
            const equipo = estado.mapaMaterialAEquipo[clave] || "";
            
            // Mapear clases agrupadas a nombres simples para exportación
            const claseExport = 
                clase === "Campeón y Planewalker" ? "Campeón" :
                clase === "Lord y Noble Lord" ? "Lord" :
                clase;
            
            csvContent += `${claseExport},${equipo},${material},${valores.dorado || '0'},${valores.morado || '0'},${valores.azul || '0'},${valores.verde || '0'},${valores.blanco || '0'}\n`;
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'materiales.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error al exportar CSV:', error);
        modales.mostrarMensaje('Error', 'Ocurrió un problema al exportar el archivo CSV', 'error');
    }
}

export function importarCSV(archivo, estado) {
    const lector = new FileReader();

    lector.onload = function(e) {
        try {
            const contenido = e.target.result;
            const lineas = contenido.split('\n').filter(linea => linea.trim() !== '');

            if (lineas.length < 2) {
                modales.mostrarMensaje('Error', 'El archivo CSV está vacío o no tiene el formato correcto', 'error');
                return;
            }

            const encabezados = lineas[0].split(',').map(h => h.trim());
            const indiceClase = encabezados.indexOf('Clase');
            const indiceEquipo = encabezados.indexOf('Equipo');
            const indiceMaterial = encabezados.indexOf('Material');
            const indiceDorado = encabezados.indexOf('Dorado');
            const indiceMorado = encabezados.indexOf('Morado');
            const indiceAzul = encabezados.indexOf('Azul');
            const indiceVerde = encabezados.indexOf('Verde');
            const indiceBlanco = encabezados.indexOf('Blanco');

            if (indiceClase === -1 || indiceMaterial === -1 ||
                indiceDorado === -1 || indiceMorado === -1 ||
                indiceAzul === -1 || indiceVerde === -1 ||
                indiceBlanco === -1) {
                modales.mostrarMensaje('Error', 'El archivo CSV no tiene las columnas requeridas', 'error');
                return;
            }

            let materialesImportados = 0;
            let materialesIgnorados = 0;

            for (let i = 1; i < lineas.length; i++) {
                const valores = lineas[i].split(',').map(v => v.trim());
                if (valores.length < encabezados.length) continue;

                let clase = valores[indiceClase];
                const material = valores[indiceMaterial];
                
                // Convertir clases individuales a grupos
                if (clase === "Campeón" || clase === "Planewalker") {
                    clase = "Campeón y Planewalker";
                } else if (clase === "Lord" || clase === "Noble Lord") {
                    clase = "Lord y Noble Lord";
                }
                
                const clave = `${clase}:${material}`;

                // Solo importar si el material existe en los datos
                if (estado.almacenMateriales[clave] || 
                   (estado.materialesData[clase] && 
                    (clase === "Lord y Noble Lord" ? 
                     estado.materialesData[clase].common.includes(material) : 
                     Object.values(estado.materialesData[clase]).flat().includes(material)))) {
                    
                    // Crear entrada si no existe
                    if (!estado.almacenMateriales[clave]) {
                        estado.almacenMateriales[clave] = {
                            'dorado': '0',
                            'morado': '0',
                            'azul': '0',
                            'verde': '0',
                            'blanco': '0'
                        };
                    }
                    
                    // Actualizar valores
                    estado.almacenMateriales[clave] = {
                        'dorado': valores[indiceDorado] || '0',
                        'morado': valores[indiceMorado] || '0',
                        'azul': valores[indiceAzul] || '0',
                        'verde': valores[indiceVerde] || '0',
                        'blanco': valores[indiceBlanco] || '0'
                    };
                    materialesImportados++;
                } else {
                    materialesIgnorados++;
                }
            }

            guardarMaterialesEnLocalStorage(estado);
            estado.cambiosPendientes = true;

            let mensaje = `Se importaron ${materialesImportados} materiales correctamente`;
            if (materialesIgnorados > 0) {
                mensaje += `\n${materialesIgnorados} materiales no reconocidos fueron ignorados`;
            }

            modales.mostrarMensaje('Éxito', mensaje, 'success');
        } catch (error) {
            console.error('Error al importar CSV:', error);
            modales.mostrarMensaje('Error', 'Ocurrió un error al procesar el archivo CSV', 'error');
        }
    };

    lector.onerror = function() {
        modales.mostrarMensaje('Error', 'Error al leer el archivo', 'error');
    };

    lector.readAsText(archivo);
}