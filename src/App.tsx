import './App.css'

const GRID_SIZE = 16

function Grid() {
  const generateInnerGrid = () => {
    const gridItems = []

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        const classNames = []
        classNames.push('grid-item')
        classNames.push(`row-${i} column-${j}`)

        const key = `${i}-${j}`

        gridItems.push(
          <div key={key} className={classNames.join(' ')}>{}</div>
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
