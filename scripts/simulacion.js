// scripts/simulacion.js
export function simularUso(cantidadesIniciales, colorObjetivo) {
    const ordenColores = ["blanco", "verde", "azul", "morado", "dorado"];
    // Crear copia profunda de los valores
    const stockTemporal = JSON.parse(JSON.stringify(cantidadesIniciales));

    const indiceObjetivo = ordenColores.indexOf(colorObjetivo);
    if (indiceObjetivo === -1) {
        return { stock: {...cantidadesIniciales}, exito: false };
    }

    function obtenerMaterialRequerido(colorActual, cantidadNecesaria) {
        const indiceActual = ordenColores.indexOf(colorActual);

        // 1. Usar material directo si disponible
        if (stockTemporal[colorActual] >= cantidadNecesaria) {
            stockTemporal[colorActual] -= cantidadNecesaria;
            return true;
        }

        // 2. Si no hay suficiente y no es el nivel más bajo, fusionar
        if (indiceActual > 0) {
            const colorInferior = ordenColores[indiceActual - 1];
            const cantidadFaltante = cantidadNecesaria - stockTemporal[colorActual];
            const cantidadRequeridaInferior = cantidadFaltante * 4;

            if (obtenerMaterialRequerido(colorInferior, cantidadRequeridaInferior)) {
                stockTemporal[colorActual] = Math.max(0, stockTemporal[colorActual] - cantidadNecesaria);
                return true;
            }
        }

        return false;
    }

    return {
        stock: stockTemporal,
        exito: obtenerMaterialRequerido(colorObjetivo, 1)
    };
}