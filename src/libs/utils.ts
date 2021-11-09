export function cloneClass<T>(instance: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance)
}

export function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}
