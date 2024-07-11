export function generatePassword(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789@';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset.charAt(randomIndex);
  }
  return password;
}

export function generateTicketId() {
  const prefix = 'MQ';

  // Get the current date
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1 and pad with 0 if needed

  // Generate a random 4-digit number
  const randomNumber = Math.floor(1000 + Math.random() * 9000); // Ensures a 4-digit number

  // Combine into the desired format
  const ticketId = `${prefix}${year}${month}${randomNumber}`;

  return ticketId;
}

export function replacePlaceholders(htmlString, placeholders) {
  // Loop through each placeholder and replace it in the HTML string
  for (const placeholder in placeholders) {
    if (placeholders.hasOwnProperty(placeholder)) {
      const value = placeholders[placeholder];
      const regex = new RegExp('{' + placeholder + '}', 'g');
      htmlString = htmlString.replace(regex, value);
    }
  }
  return htmlString;
}