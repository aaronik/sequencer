import './reset.css';
import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import './App.scss'
import { GRID_SIZE, PROPAGATION_SPEED, TUNINGS } from './constants'
import Grid from './Grid'
import PlayButton from './PlayButton'
import SettingsButton from './SettingsButton'
import { addAndReleaseClass, buildColumnClass } from './util'
import SettingsModal from './SettingsModal';

// TODO
// * I think it'd be dope to have another set of rows underneath, maybe with a different color, that represented drums.
// In searching for making drums with tone.js, i found these limited examples:
// - https://tonejs.github.io/docs/14.7.77/MembraneSynth.html
// - https://gist.github.com/vibertthio/9c815b7edeee2aab3aec35de7dfa57bb
// In short, I think the only real way to get good drums is to sample.

const container = () => document.querySelector('.grid')!

const animate = (i: number, j: number) => {
  addAndReleaseClass(container(), `active-item-${i}-${j}`, 0, PROPAGATION_SPEED * 1.5)
  addAndReleaseClass(container(), `active-neighbor-${i}-${j}`, PROPAGATION_SPEED, PROPAGATION_SPEED * 2)
  addAndReleaseClass(container(), `active-second-neighbor-${i}-${j}`, PROPAGATION_SPEED * 1.5, PROPAGATION_SPEED * 2.5)
}

const removeAllActiveColumns = () => {
  for (let i = 0; i < GRID_SIZE; i++) {
    container().classList.remove(`column-${i}-active`)
  }
}

const sound = (row: number, synth: Tone.PolySynth, notes: string[]) => {
  synth.triggerAttackRelease(notes[row], "8n", Tone.now())
}

const playColumn = (column: number, synth: Tone.PolySynth, tuning: keyof typeof TUNINGS) => {
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
    sound(i, synth, TUNINGS[tuning].notes)
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

let column = 0
let isToneInitialized = false

// A note on play timing.
// I tried:
// * Setting a new setTimeout on each invocation of play, but this made
// the browser stutter pretty bad. It didn't sound good.
// * I was really stoked to try Tone.Transport, as it has bpm rampup
// and swing, but it was all the heck over the place. setInterval was
// drastically more smooth. It also made the browser stutter. I suspect under
// the hood it uses setTimeout repeatedly like I tried.
function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [tempo, setTempo] = useState(150)
  const [tuning, setTuning] = useState<keyof typeof TUNINGS>('maj5')
  const playbackInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const bps = tempo / 60
  const playInterval = 500 / bps

  const startPlay = async () => {
    if (!isToneInitialized) {
      await Tone.start()
      isToneInitialized = true
    }

    const synth = new Tone.PolySynth(Tone.Synth).toDestination()

    playColumn(column, synth, tuning)
    playbackInterval.current = setInterval(() => {
      column = (column + 1) % (GRID_SIZE)
      playColumn(column, synth, tuning)
    }, playInterval)
  }

  // If the tempo or tuning changes, this is how we keep this playing and
  // switch. It's not perfect but it's good enough.
  useEffect(() => {
    if (!isPlaying) { return }
    stopPlay(false)
    startPlay()
  }, [tempo, tuning])

  const stopPlay = (shouldResetColumn = true) => {
    if (shouldResetColumn) column = 0
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
    if (e.key === 'Escape') {
      setIsSettingsModalOpen(false)
    }
  })

  return (
    <div className="container">
      <SettingsModal
        isOpen={isSettingsModalOpen}
        close={() => setIsSettingsModalOpen(false)}
        tempo={tempo}
        setTempo={setTempo}
        tuning={tuning}
        setTuning={setTuning}
      />
      <Grid activeColor={TUNINGS[tuning].color}/>
      <div id="button-row">
        <SettingsButton onClick={() => setIsSettingsModalOpen(!isSettingsModalOpen)} />
        <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
      </div>
      <a id="github" target="_blank" href="https://github.com/aaronik/sequencer"><img src="github.png" /></a>
    </div>
  );
}

export default App
