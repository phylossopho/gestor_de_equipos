// scripts/galeria.js
import * as modales from './modales.js';

export function cargarImagenesGuardadas(estado) {
    try {
        const imagenesGuardadas = localStorage.getItem('imagenesGaleria');
        if (imagenesGuardadas) {
            estado.imagenesGaleria = JSON.parse(imagenesGuardadas);
        }
    } catch (e) {
        console.error('Error al cargar imágenes:', e);
    }
}

export function abrirGaleria(estado) {
    const modal = document.getElementById('gallery-modal');
    const contenedor = document.getElementById('gallery-container');
    contenedor.innerHTML = '';

    estado.imagenesGaleria.forEach((imagen, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';

        const img = document.createElement('img');
        img.src = imagen;
        img.alt = `Imagen ${index + 1}`;
        img.addEventListener('click', () => {
            estado.indiceCarruselActual = index;
            mostrarImagenCarrusel(estado);
        });

        const controles = document.createElement('div');
        controles.className = 'gallery-item-controls';

        const botonEliminar = document.createElement('button');
        botonEliminar.className = 'delete-image-button';
        botonEliminar.innerHTML = '×';
        botonEliminar.addEventListener('click', (e) => {
            e.stopPropagation();
            eliminarImagen(estado, index);
        });

        controles.appendChild(botonEliminar);
        item.appendChild(img);
        item.appendChild(controles);
        contenedor.appendChild(item);
    });

    modal.style.display = 'block';
}

export function agregarImagenAGaleria(archivo, estado) {
    const lector = new FileReader();

    lector.onload = function(e) {
        estado.imagenesGaleria.push(e.target.result);
        localStorage.setItem('imagenesGaleria', JSON.stringify(estado.imagenesGaleria));
        abrirGaleria(estado);
    };

    lector.readAsDataURL(archivo);
}

function eliminarImagen(estado, index) {
    estado.imagenesGaleria.splice(index, 1);
    localStorage.setItem('imagenesGaleria', JSON.stringify(estado.imagenesGaleria));
    abrirGaleria(estado);
}

export function mostrarImagenCarrusel(estado) {
    const modal = document.getElementById('carousel-modal');
    const imagen = document.getElementById('carousel-image');
    const contador = document.getElementById('carousel-counter');

    if (estado.imagenesGaleria.length > 0) {
        imagen.src = estado.imagenesGaleria[estado.indiceCarruselActual];
        contador.textContent = `${estado.indiceCarruselActual + 1} / ${estado.imagenesGaleria.length}`;
        modal.style.display = 'block';
    }
}

export function mostrarImagenAnteriorCarrusel(estado) {
    if (estado.imagenesGaleria.length === 0) return;

    estado.indiceCarruselActual = (estado.indiceCarruselActual - 1 + estado.imagenesGaleria.length) % estado.imagenesGaleria.length;
    mostrarImagenCarrusel(estado);
}

export function mostrarImagenSiguienteCarrusel(estado) {
    if (estado.imagenesGaleria.length === 0) return;

    estado.indiceCarruselActual = (estado.indiceCarruselActual + 1) % estado.imagenesGaleria.length;
    mostrarImagenCarrusel(estado);
}