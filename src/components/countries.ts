export const countries = [
  {
    name: 'Deutschland',
    code: 'de',
  },
  {
    name: 'all',
    code: '',
  }
] as const
export type CountryCode = typeof countries[number]['code']

export default countries
