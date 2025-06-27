// scripts/modales.js
export function mostrarMensaje(titulo, mensaje, tipo = "info") {
    const container = document.getElementById('toast-container');
    const template = document.getElementById('toast-template');
    
    // Clonar la plantilla
    const toast = template.cloneNode(true);
    toast.id = ''; // Eliminar el id para no duplicar
    toast.classList.add('show', `toast-${tipo}`);
    
    // Configurar título y cuerpo
    toast.querySelector('.toast-title').textContent = titulo;
    toast.querySelector('.toast-body').textContent = mensaje;
    
    // Configurar el botón de cerrar
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Agregar al contenedor
    container.appendChild(toast);
    
    // Mostrar el toast
    setTimeout(() => {
        toast.style.display = 'block';
    }, 10);
    
    // Eliminar después de 3 segundos (3000ms) + 300ms de animación
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 1890);
}

export function alternarMenuCSVMovil() {
    const menu = document.getElementById('mobile-csv-menu');
    menu.classList.toggle('visible');
}

export function ocultarMenuCSVMovil() {
    const menu = document.getElementById('mobile-csv-menu');
    menu.classList.remove('visible');
}

export function cerrarModales() {
    document.getElementById('materials-modal').style.display = 'none';
    document.getElementById('gallery-modal').style.display = 'none';
    document.getElementById('carousel-modal').style.display = 'none';
}