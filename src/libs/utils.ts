export function cloneClass<T>(instance: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(instance)), instance)
}
