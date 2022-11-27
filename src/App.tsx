import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import './App.scss'
import { GRID_SIZE, PLAYBACK_SPEED, PROPAGATION_SPEED } from './constants'
import Grid from './Grid'
import PlayButton from './PlayButton'
import { addAndReleaseClass, buildColumnClass } from './util'

// TODO
// * I think it'd be dope to have another set of rows underneath, maybe with a different color, that represented drums.
// In searching for making drums with tone.js, i found these limited examples:
// - https://tonejs.github.io/docs/14.7.77/MembraneSynth.html
// - https://gist.github.com/vibertthio/9c815b7edeee2aab3aec35de7dfa57bb
// In short, I think the only real way to get good drums is to sample.

const NOTES = [
  'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7'
].reverse()

const container = () => document.querySelector('.grid')!

const animate = (i: number, j: number) => {
  addAndReleaseClass(container(), `active-item-${i}-${j}`, 0, PROPAGATION_SPEED * 1.5)
  addAndReleaseClass(container(), `active-neighbor-${i}-${j}`, PROPAGATION_SPEED, PROPAGATION_SPEED * 2)
  addAndReleaseClass(container(), `active-second-neighbor-${i}-${j}`, PROPAGATION_SPEED * 1.5, PROPAGATION_SPEED * 3)
}

const removeAllActiveColumns = () => {
  for (let i = 0; i < GRID_SIZE; i++) {
    container().classList.remove(`column-${i}-active`)
  }
}

const sound = (row: number, synth: Tone.PolySynth) => {
  synth.triggerAttackRelease(NOTES[row], "8n", Tone.now())
}

const playColumn = (column: number, synth: Tone.PolySynth) => {
  // Remove the previous column that was played
  const prevColumn = column - 1 < 0 ? GRID_SIZE - 1 : column - 1
  container().classList.remove(`column-${prevColumn}-active`)

  // Add the top level class, for which we have (lots of) lower level css rules
  container().classList.add(`column-${column}-active`)

  const playingItems = document.querySelectorAll('.enabled.' + buildColumnClass(column)) as NodeListOf<HTMLElement>

  playingItems.forEach(item => {
    const i = +(item.dataset.i as string)
    const j = +(item.dataset.j as string)
    animate(i, j)
    sound(i, synth)
  })
}

const useEvent = (event: string, listener: (e: Event) => void, passive = false) => {
  useEffect(() => {
    // initiate the event handler
    window.addEventListener(event, listener, passive)

    // this will clean up the event every time the component is re-rendered
    return function cleanup() {
      window.removeEventListener(event, listener)
    }
  })
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const playbackInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const startPlay = async () => {
    await Tone.start()
    const synth = new Tone.PolySynth(Tone.Synth).toDestination()

    let column = 1
    playColumn(0, synth)
    playbackInterval.current = setInterval(() => {
      playColumn(column, synth)
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

  useEvent('keydown', (event) => {
    const e = event as KeyboardEvent
    if (e.key === ' ') togglePlay()
  })

  return (
    <div className="container">
      <Grid />
      <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
      <a id="github" target="_blank" href="https://github.com/aaronik/sequencer"><img src="github.png" /></a>
    </div>
  );
}

export default App
