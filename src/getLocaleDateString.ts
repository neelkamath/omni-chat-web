export default function getLocaleDateString(dateTime: number | string | Date): string {
  const locale = undefined; // Set the locale to <undefined> to use the user's default locale.
  return new Date(dateTime).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}
