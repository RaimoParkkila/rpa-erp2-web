export const formatDateES = (date: string) =>
  new Date(date).toLocaleDateString("es-ES");

export const formatDateTimeES = (date: string) =>
  new Date(date).toLocaleString("es-ES");