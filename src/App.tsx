import './App.css'

const GRID_SIZE = 16

function Grid() {
  const generateInnerGrid = () => {
    const gridItems = []

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const classNames = []
        classNames.push('grid-item')
        // classNames.push(`row-${i} column-${j}`)

        // Assign immediate neighbor classNames
        for (let m = i - 1; m <= i + 1; m++) {
          for (let n = j - 1; n <= j + 1; n ++) {
            // we don't want to label ourselves as a neighbor to ourselves
            if (m === i && n === j) continue
            classNames.push(`${m}-${n}-neighbor`)
          }
        }

        // Assign secondary neighbor classNames
        for (let m = i - 2; m <= i + 2; m++) {
          for (let n = j - 2; n <= j + 2; n ++) {
            // we don't want to label ourselves as a neighbor to ourselves
            if (m === i && n === j) continue
            classNames.push(`${m}-${n}-second-neighbor`)
          }
        }


        const key = `${i}-${j}`

        gridItems.push(
          <div key={key} className={classNames.join(' ')}>{key}</div>
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

function App() {
  return (
    <div className="App">
      <Grid/>
    </div>
  );
}

export default App
