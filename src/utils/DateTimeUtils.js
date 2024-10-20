export const millisecondsToHours = (milliseconds) => {
  const totalMinutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours >= 1) {
      return `${hours} hora${hours > 1 ? 's' : ''} y ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  } else {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
}
