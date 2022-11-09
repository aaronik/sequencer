import { useRef, useState } from 'react'
import './App.css'

const GRID_SIZE = 16
const PROPAGATION_SPEED = 50
const PLAYBACK_SPEED = 200 // per column

const buildItemClass = (i: number, j: number) => `item-${i}-${j}`
const buildNeighborClass = (i: number, j: number) => `neighbor-${i}-${j}`
const buildSecondNeighborClass = (i: number, j: number) => `second-neighbor-${i}-${j}`
const buildColumnClass = (column: number) => `column-${column}`

const animate = (i: number, j: number) => {
  const item = document.querySelector('.' + buildItemClass(i, j))
  const itemNeighbors = document.querySelectorAll('.' + buildNeighborClass(i, j))
  const itemSecondNeighbors = document.querySelectorAll('.' + buildSecondNeighborClass(i, j))

  item?.classList.add('active-item')
  setTimeout(() => itemNeighbors.forEach(neighbor => neighbor.classList.add('active-neighbor')), PROPAGATION_SPEED)
  setTimeout(() => itemSecondNeighbors.forEach(secondNeighbor => secondNeighbor.classList.add('active-second-neighbor')), PROPAGATION_SPEED * 2)

  setTimeout(() => item?.classList.remove('active-item'), PROPAGATION_SPEED * 3)
  setTimeout(() => itemNeighbors.forEach(neighbor => neighbor.classList.remove('active-neighbor')), PROPAGATION_SPEED * 4)
  setTimeout(() => itemSecondNeighbors.forEach(secondNeighbor => secondNeighbor.classList.remove('active-second-neighbor')), PROPAGATION_SPEED * 5)
}

function Grid() {
  const onClick = (i: number, j: number) => () => {
    document.querySelector('.' + buildItemClass(i, j))?.classList.toggle('enabled')
  }

  const generateInnerGrid = () => {
    const gridItems = []

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const classNames = []
        classNames.push('grid-item')
        classNames.push(buildColumnClass(j))
        classNames.push(buildItemClass(i, j))

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

        gridItems.push(
          <div key={key} className={classNames.join(' ')} onClick={onClick(i, j)}>{}</div>
        )
      }
    }

    return gridItems
  }

  return (
    <div className='grid-container'>
      {generateInnerGrid()}
    </div>
  )
}

type PlayButtonProps = {
  isPlaying: boolean
  onClick: () => void
}

function PlayButton({ isPlaying, onClick }: PlayButtonProps) {

  return (
    <div id='play-button' onClick={onClick}>
      {<div id='play-triangle' className={isPlaying ? 'hidden' : ''}></div>}
      {<div id='stop-square' className={isPlaying ? '' : 'hidden'}></div>}
    </div>
  )
}

const removeAllActiveColumns = () => {
  const allItems = document.querySelectorAll('.grid-item')
  allItems.forEach(item => item.classList.remove('active-column'))
}

const playColumn = (column: number) => {
  removeAllActiveColumns()

  const playingItems = document.querySelectorAll('.' + buildColumnClass(column))
  playingItems.forEach((item, row) => {
    item.classList.add('active-column')
    if (item.classList.contains('enabled')) {
      animate(row, column)
      // sound(row, column)
    }
  })
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const playbackInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const startPlay = () => {
    let column = 1
    playColumn(0)
    playbackInterval.current = setInterval(() => {
      playColumn(column)
      column = (column + 1) % (GRID_SIZE)
    }, PLAYBACK_SPEED)
  }

  const stopPlay = () => {
    clearInterval(playbackInterval.current!)
    removeAllActiveColumns()
  }


  const togglePlay = () => {
    if (isPlaying) stopPlay()
    else startPlay()
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="App">
      <Grid />
      <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
    </div>
  );
}

export default App
