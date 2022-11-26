
/**
* @description Add {className} to {node} in {start} ms, and remove it in {end} ms.
*/
export const addAndReleaseClass = (node: Element, className: string, start: number, end: number) => {
  setTimeout(() => node.classList.add(className), start)
  setTimeout(() => node.classList.remove(className), end)
}

