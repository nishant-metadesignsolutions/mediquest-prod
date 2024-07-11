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
