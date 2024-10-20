export const shortenString = (str = '', charsAtStart, charsAtEnd) => {
  if (str.length <= charsAtStart + charsAtEnd) {
    // Si la longitud de la cadena es menor o igual a la suma de caracteres requeridos, devuelve la cadena completa
    return str;
  }

  // Obtener los caracteres del inicio y del final
  const start = str.substring(0, charsAtStart);
  const end = str.substring(str.length - charsAtEnd);

  // Concatenar los caracteres del inicio y el final con puntos suspensivos en el medio
  return `${start}...${end}`;
}