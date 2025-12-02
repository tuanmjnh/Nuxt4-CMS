export const toSlug = (str: string) => {
  return str
    .trim()
    .toLowerCase()
    .normalize('NFD') // Separate accents from characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[đĐ]/g, 'd') // Convert đ -> d
    .replace(/([^0-9a-z-\s])/g, '') // Remove special characters
    .replace(/(\s+)/g, '-') // Convert spaces to dashes
    .replace(/-+/g, '-') // Remove excess dashes
    .replace(/^-+|-+$/g, ''); // Remove terminal dashes
}