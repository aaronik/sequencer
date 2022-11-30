import './reset.css'
import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import './App.scss'
import { GRID_SIZE, PROPAGATION_SPEED, TUNINGS } from './constants'
import Grid from './Grid'
import PlayButton from './PlayButton'
import SettingsButton from './SettingsButton'
import { addAndReleaseClass, buildColumnClass, disableAllGridItems, enableGridItem, getActiveGridItems } from './util'
import SettingsModal from './SettingsModal'
import SaveButton from './SaveButton'
import SaveModal from './SaveModal'
import type Network from '@browser-network/network'
import type Db from '@browser-network/database'
import { buildNetworkAndDb } from './network'
import { DbItem } from './types'
import React from 'react'

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
let synth: Tone.PolySynth

type Net = {
  network?: Network
  db?: Db<DbItem>
}
const net: Net = {

}

const getLocallyStoredNetworkSecret = () => localStorage?.getItem('browser-network-secret') || ''
const setNetworkSecretLocally = (secret: string) => localStorage?.setItem('browser-network-secret', secret)

const DEFAULT_DB_ITEM = {
  id: window.crypto.randomUUID(),
  name: "",
  saves: []
}

const validateDbItem = (dbItem: DbItem): boolean => {
  if (!dbItem) return false
  if (!dbItem.id) return false
  if (typeof dbItem.name !== 'string') return false
  if (!Array.isArray(dbItem.saves)) return false

  for (let save of dbItem.saves) {
    if (!save.id) return false
    if (typeof save.name !== 'string') return false
    if (!save.tuning) return false
    if (typeof save.tempo !== 'number') return false
    if (!Array.isArray(save.activeGridItems)) return false

    for (let gridItem of save.activeGridItems) {
      if (!Number.isSafeInteger(gridItem.i)) return false
      if (!Number.isSafeInteger(gridItem.j)) return false
    }
  }

  return true
}

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
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  const [tempo, setTempo] = useState(150)
  const [tuning, setTuning] = useState<keyof typeof TUNINGS>('maj5')
  const [secret, setSecret] = useState(getLocallyStoredNetworkSecret())
  const [numConnections, setNumConnections] = useState(0)
  const [dbItems, setDbItems] = useState<DbItem[]>([])
  const [ourDbItem, setOurDbItem] = useState<DbItem>()
  const playbackInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const signIn = (secret: string) => {
    setNetworkSecretLocally(secret)
    setSecret(secret)
    const [network, db] = buildNetworkAndDb(secret)
    net.network = network
    net.db = db
    updateDbItems()
    network.on('add-connection', updateConnections)
    network.on('destroy-connection', updateConnections)
    db.onChange(updateDbItems)
  }

  useEffect(() => {
    // The thinking here is that this means specifically that we've opened
    // the page with a secret already in localStorage
    if (secret && !net.network) {
      signIn(secret)
    }
  }, [secret])

  const signOut = () => {
    setNetworkSecretLocally("")
    setSecret("")
    setNumConnections(0)
    setOurDbItem(undefined)
    setDbItems([])
    net.network!.removeListener('add-connection', updateConnections)
    net.network!.removeListener('destroy-connection', updateConnections)
    net.db!.removeChangeHandlers()
    net.network!.teardown()
    delete net.network
    delete net.db
  }

  const serializeState = (): DbItem['saves'][number] => {
    return {
      id: window.crypto.randomUUID(),
      name: "",
      tuning: tuning,
      tempo: tempo,
      activeGridItems: getActiveGridItems()
    }
  }

  const setSerializedState = (save: DbItem['saves'][number]) => {
    const tuning = save.tuning as keyof typeof TUNINGS
    if (TUNINGS[tuning]) {
      setTuning(tuning)
    }
    setTempo(save.tempo)
    disableAllGridItems()
    save.activeGridItems.forEach(item => {
      enableGridItem(item.i, item.j)
    })
  }

  const bps = tempo / 60
  const playInterval = 500 / bps

  const startPlay = async () => {
    if (!isToneInitialized) {
      await Tone.start()
      isToneInitialized = true
      synth = new Tone.PolySynth(Tone.Synth).toDestination()
    }

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

  const updateConnections = () => setNumConnections(net.network?.activeConnections.length || 0)
  const updateDbItems = () => {
    if (!net.db) return
    let items = net.db.getAll().map(i => i.state)
    items = items.filter(validateDbItem)
    setDbItems(items)
    const ours = net.db.get(net.db.publicKey)?.state
    if (ours && validateDbItem(ours)) {
      setOurDbItem(ours)
    }
  }

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
      setIsSaveModalOpen(false)
    }
  })

  useEvent('click', () => {
    setIsSettingsModalOpen(false)
    setIsSaveModalOpen(false)
  })

  return (
    <React.Fragment>
      <div className="container">
        <SettingsModal
          isOpen={isSettingsModalOpen}
          close={() => setIsSettingsModalOpen(false)}
          tempo={tempo}
          setTempo={setTempo}
          tuning={tuning}
          setTuning={setTuning}
        />
        <SaveModal
          isOpen={isSaveModalOpen}
          close={() => setIsSaveModalOpen(false)}
          needsSecret={!secret}
          setSecret={signIn}
          numConnections={numConnections}
          ourDbItem={ourDbItem || DEFAULT_DB_ITEM}
          dbItems={dbItems}
          saveItem={(item: DbItem) => net.db!.set(item)}
          getSerializedCurrentState={serializeState}
          loadSave={save => {
            setSerializedState(save)
            setIsSaveModalOpen(false)
          }}
          signOut={signOut}
        />
        <Grid activeColor={TUNINGS[tuning].color} />
        <div id="button-row" onClick={e => e.stopPropagation()}>
          <SettingsButton onClick={() => {
            setIsSettingsModalOpen(!isSettingsModalOpen)
            setIsSaveModalOpen(false)
          }} />
          <PlayButton isPlaying={isPlaying} onClick={togglePlay} />
          <SaveButton onClick={() => {
            setIsSaveModalOpen(!isSaveModalOpen)
            setIsSettingsModalOpen(false)
          }} />
        </div>
      </div>
      <a id="github" target="_blank" href="https://github.com/aaronik/sequencer"><img src="github.png" /></a>
    </React.Fragment>
  );
}

export default App
