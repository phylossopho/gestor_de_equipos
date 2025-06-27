// scripts/datos.js
export const mapaColores = {
    'blanco': 'white',
    'verde': '#90EE90',
    'azul': '#ADD8E6',
    'morado': '#DDA0DD',
    'dorado': '#FFD700'
};

export const datosMateriales = {
    "Normal": {
        "Espada": ["Maxilar", "Garra", "Hoja", "Césped"],
        "Pecho":  ["Maxilar", "Garra", "Hoja", "Césped"],
        "Botas":  ["Nudo", "Acero", "Pluma", "Extraer"],
        "Casco":  ["Nudo", "Acero", "Pluma", "Extraer"],
        "Guantes":["Diente de sierra", "Pelaje", "Cristal", "Stardust"],
        "Cinturón":["Diente de sierra", "Pelaje", "Cristal", "Stardust"]
    },
    "Campeón y Planewalker": {
        "Espada": ["Quijada ácida", "Oro talon", "Hoja de jade", "Ámbar hierba"],
        "Pecho":  ["Quijada ácida", "Oro talon", "Hoja de jade", "Ámbar hierba"],
        "Botas":  ["Carbonizado gnarl", "Acero reforzado", "Pluma Stick", "Extracto destilado"],
        "Casco":  ["Carbonizado gnarl", "Acero reforzado", "Pluma Stick", "Extracto destilado"],
        "Guantes":["Razor diente de sierra", "Piel de terciopelo", "Crystal mystic", "Tempest Stardust"],
        "Cinturón":["Razor diente de sierra", "Piel de terciopelo", "Crystal mystic", "Tempest Stardust"]
    },
    "Lord y Noble Lord": {
        "common": [
            "Voluntad del emperador",
            "Guardia del emperador",
            "Alma del emperador",
            "Aliento del emperador"
        ]
    }
};

// Definir restricciones por clase
export const restriccionesClase = {
    "Campeón": {
        nivelesPermitidos: ["4"],
        coloresPermitidos: ["azul", "morado", "dorado"],
        mensajeBase: "Equipo normal de nivel 4",
        descripcion: "Los equipos de Campeón requieren equipo normal de nivel 4 como base y solo pueden crearse en colores azul, morado o dorado",
        // NUEVO: Opciones disponibles para el selector base
        opcionesBase: {
            "Espada": "Espada normal nivel 4",
            "Pecho": "Pecho normal nivel 4",
            "Botas": "Botas normales nivel 4",
            "Casco": "Casco normal nivel 4",
            "Guantes": "Guantes normales nivel 4",
            "Cinturón": "Cinturón normal nivel 4"
        },
        // NUEVO: Estilos para el selector base
        estilosBase: {
            imagen: {
                maxWidth: "60px",
                maxHeight: "60px",
                margin: "0 auto",
                display: "block"
            },
            selector: {
                textAlign: "center"
            }
        }
    },
    // Podemos agregar restricciones para otras clases en el futuro
    "Normal": {
        coloresPermitidos: ["blanco", "verde", "azul", "morado", "dorado"],
        opcionesBase: {
            "Espada": "Espada normal",
            "Pecho": "Pecho normal",
            "Botas": "Botas normales",
            "Casco": "Casco normal",
            "Guantes": "Guantes normales",
            "Cinturón": "Cinturón normal"
        }
    },
    "Planewalker": {
        coloresPermitidos: ["azul", "morado", "dorado"],
        opcionesBase: {
            "Espada": "Espada planewalker",
            "Pecho": "Pecho planewalker",
            "Botas": "Botas planewalker",
            "Casco": "Casco planewalker",
            "Guantes": "Guantes planewalker",
            "Cinturón": "Cinturón planewalker"
        }
    },
    "Lord": {
        coloresPermitidos: ["azul", "morado", "dorado"],
        opcionesBase: {
            "Espada": "Espada lord",
            "Pecho": "Pecho lord",
            "Botas": "Botas lord",
            "Casco": "Casco lord",
            "Guantes": "Guantes lord",
            "Cinturón": "Cinturón lord"
        }
    },
    "Noble Lord": {
        coloresPermitidos: ["azul", "morado", "dorado"],
        opcionesBase: {
            "Espada": "Espada noble lord",
            "Pecho": "Pecho noble lord",
            "Botas": "Botas noble lord",
            "Casco": "Casco noble lord",
            "Guantes": "Guantes noble lord",
            "Cinturón": "Cinturón noble lord"
        }
    }
};

// Datos de imágenes disponibles para cada tipo de equipo
export const imagenesEquipos = {
    "Espada": "espada.png",
    "Pecho": "pecho.png",
    "Botas": "botas.png",
    "Casco": "casco.png",
    "Guantes": "guantes.png",
    "Cinturón": "cinturon.png"
};

// Niveles disponibles por clase
export const nivelesPorClase = {
    "Normal": ["1", "2", "3", "4", "5"],
    "Campeón": ["4"],
    "Planewalker": ["1", "2", "3", "4", "5"],
    "Lord": ["1", "2", "3", "4", "5"],
    "Noble Lord": ["1", "2", "3", "4", "5"]
};

// Colores disponibles por clase
export const coloresPorClase = {
    "Normal": ["blanco", "verde", "azul", "morado", "dorado"],
    "Campeón": ["morado", "dorado"],
    "Planewalker": ["blanco", "verde", "azul", "morado", "dorado"],
    "Lord": ["blanco", "verde", "azul", "morado", "dorado"],
    "Noble Lord": ["blanco", "verde", "azul", "morado", "dorado"]
};

// Función para obtener las restricciones de una clase específica
export function obtenerRestriccionesClase(clase) {
    return restriccionesClase[clase] || {
        nivelesPermitidos: nivelesPorClase[clase] || ["1", "2", "3", "4", "5"],
        coloresPermitidos: coloresPorClase[clase] || ["blanco", "verde", "azul", "morado", "dorado"],
        mensajeBase: "Base",
        opcionesBase: {},
        estilosBase: {}
    };
}

// Mapa de conversión entre nombres de clases
export const mapaClases = {
    "Campeón": "Campeón y Planewalker",
    "Planewalker": "Campeón y Planewalker",
    "Lord": "Lord y Noble Lord",
    "Noble Lord": "Lord y Noble Lord"
};

// Validación de configuraciones permitidas
export function esConfiguracionValida(clase, nivel, color) {
    const restricciones = obtenerRestriccionesClase(clase);
    
    // Verificar nivel permitido
    if (!restricciones.nivelesPermitidos.includes(nivel)) {
        return false;
    }
    
    // Verificar color permitido
    if (!restricciones.coloresPermitidos.includes(color)) {
        return false;
    }
    
    return true;
}

// NUEVO: Opciones para el selector base
export function obtenerOpcionesBase(clase, equipo) {
    const restricciones = obtenerRestriccionesClase(clase);
    
    if (restricciones.opcionesBase && restricciones.opcionesBase[equipo]) {
        return restricciones.opcionesBase[equipo];
    }
    
    return "Base";
}

// NUEVO: Estilos para el selector base
export function obtenerEstilosBase(clase) {
    const restricciones = obtenerRestriccionesClase(clase);
    return restricciones.estilosBase || {};
}

// NUEVO: Configuración de centrado para elementos base
export const estilosCentrado = {
    contenedor: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },
    imagen: {
        margin: "0 auto",
        display: "block"
    },
    texto: {
        textAlign: "center",
        marginTop: "5px"
    }
};