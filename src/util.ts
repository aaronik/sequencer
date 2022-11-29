import { DbItem } from "./types"

/**
* @description Add {className} to {node} in {start} ms, and remove it in {end} ms.
*/
export const addAndReleaseClass = (node: Element, className: string, start: number, end: number) => {
  setTimeout(() => node.classList.add(className), start)
  setTimeout(() => node.classList.remove(className), end)
}

export const buildColumnClass         = (column: number)       => `column-${column}`
export const buildItemClass           = (i: number, j: number) => `item-${i}-${j}`
export const buildNeighborClass       = (i: number, j: number) => `neighbor-${i}-${j}`
export const buildSecondNeighborClass = (i: number, j: number) => `second-neighbor-${i}-${j}`
export const item = (i: number, j: number) => document.querySelector('.' + buildItemClass(i, j))!

// This lives here so that the toggle logic lives right next to the serialization
// logic.
export const toggleGridItem = (i: number, j: number) => {
  item(i, j).classList.toggle('enabled')
}

// This is the serialization logic :)
export const getActiveGridItems = (): DbItem['saves'][number]['activeGridItems'] => {
  const htmlItems = document.getElementsByClassName('enabled')
  return Array.from(htmlItems).map(item => {
    return {
      // @ts-ignore
      i: +item.dataset.i as number,
      // @ts-ignore
      j: +item.dataset.j as number
    }
  })
}
