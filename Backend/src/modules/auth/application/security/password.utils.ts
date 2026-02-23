/**
 * Genera una contraseña aleatoria segura
 * @param length Longitud de la contraseña (por defecto 10)
 * @returns Contraseña aleatoria
 */
export function generateRandomPassword(length: number = 10): string {
  // Conjuntos de caracteres para generar la contraseña
  const uppercaseChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I, O para evitar confusiones
  const lowercaseChars = 'abcdefghijkmnpqrstuvwxyz'; // sin l, o para evitar confusiones
  const numberChars = '23456789'; // sin 0, 1 para evitar confusiones
  const specialChars = '@#$%&*!?';
  
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
  
  // Asegurarse de que haya al menos un carácter de cada tipo
  let password = 
    uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length)) +
    lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length)) +
    numberChars.charAt(Math.floor(Math.random() * numberChars.length)) +
    specialChars.charAt(Math.floor(Math.random() * specialChars.length));
  
  // Rellenar el resto de la contraseña con caracteres aleatorios
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Mezclar los caracteres para que no siempre siga el mismo patrón
  return password
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
} 