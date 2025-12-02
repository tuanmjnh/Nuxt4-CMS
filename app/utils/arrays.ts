export const removeById = <T extends Record<string, any>>(
  items: T[],
  id: string | number,
  key: keyof T = '_id'
): T[] => {
  const index = items.findIndex((item) => item[key] === id)
  if (index !== -1) {
    items.splice(index, 1)
  }
  return items
}
