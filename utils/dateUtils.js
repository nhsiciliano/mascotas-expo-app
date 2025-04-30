import { format, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha como tiempo relativo (ej: hace 2 horas, hace 3 días)
 * @param {string} dateString - Fecha en formato ISO 
 * @returns {string} Texto formateado del tiempo relativo
 */
export const formatRelativeTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return formatDistance(date, new Date(), { addSuffix: true, locale: es });
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return 'hace un tiempo';
  }
};
