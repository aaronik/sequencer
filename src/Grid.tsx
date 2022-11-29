import './Grid.scss'
import { GRID_SIZE } from "./constants"
import { buildColumnClass, buildItemClass, buildNeighborClass, buildSecondNeighborClass, toggleGridItem } from "./util"

type GridProps = {
  activeColor: string
}

export default function Grid({ activeColor }: GridProps) {
  const onClick = (i: number, j: number) => () => {
    toggleGridItem(i, j)
  }

  const generateInnerGrid = () => {
    const gridItems = []

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const classNames = []
        classNames.push('grid-item')
        classNames.push(buildColumnClass(j))
        classNames.push(buildItemClass(i, j))
        // // This is for development. Uncomment this to get an upward trending file from left to right
        // if (i + j === GRID_SIZE - 1) classNames.push('enabled')

        // Assign secondary neighbor classNames
        for (let m = i - 2; m <= i + 2; m++) {
          for (let n = j - 2; n <= j + 2; n++) {
            // we don't want to label ourselves as a neighbor to ourselves
            if (m === i && n === j) continue

            classNames.push(buildSecondNeighborClass(m, n))
          }
        }

        // Assign immediate neighbor classNames
        for (let m = i - 1; m <= i + 1; m++) {
          for (let n = j - 1; n <= j + 1; n++) {
            // we don't want to label ourselves as a neighbor to ourselves
            if (m === i && n === j) continue
            classNames.push(buildNeighborClass(m, n))

            // Second neighbor classes were added to all around, so here we remove them.
            const index = classNames.findIndex(cn => cn === buildSecondNeighborClass(m, n))
            classNames.splice(index, 1)
          }
        }

        const key = `${i}-${j}`

        // The data attributes here are needed for both CSS animations and serialization
        gridItems.push(
          <div data-i={i} data-j={j} key={key} className={classNames.join(' ')} onClick={onClick(i, j)}>{}</div>
        )
      }
    }

    return gridItems
  }

  return (
    <div className="grid">
      <style>
        {`.grid div.grid-item.enabled { background-color: ${activeColor};`}
      </style>
      {generateInnerGrid()}
    </div>
  )
}

