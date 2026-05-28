import { format, parseISO } from 'date-fns';
import { nl } from 'date-fns/locale';

export function formatShortDate(value) {
  if (!value) return 'Nog niet';
  return format(parseISO(value), 'd MMM', { locale: nl });
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
