export type DbItem = {
  id: string
  name: string
  saves: {
    id: string
    name: string
    tuning: string // this is a keyof TUNINGS but more will definitely have been added by the time we see this
    tempo: number
    activeGridItems: {i: number, j: number}[]
  }[]
}
