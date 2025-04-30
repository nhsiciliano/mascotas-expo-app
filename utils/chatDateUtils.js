import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha en formato de hora (HH:MM)
 * @param {string} dateString - String con la fecha ISO
 * @returns {string} Hora formateada
 */
export const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'HH:mm', { locale: es });
  } catch (error) {
    console.error('Error al formatear hora:', error);
    // Fallback básico
    const date = new Date(dateString);
    return date.getHours().toString().padStart(2, '0') + ':' + 
           date.getMinutes().toString().padStart(2, '0');
  }
};

/**
 * Formatea una fecha en formato día y mes
 * @param {string} dateString - String con la fecha ISO
 * @returns {string} Fecha formateada (ej: "15 de junio")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), "dd 'de' MMMM", { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    // Fallback básico
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('es', { month: 'long' });
    return `${day} de ${month}`;
  }
};
