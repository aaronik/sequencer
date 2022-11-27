import { useState } from 'react'
import './SettingsModal.scss'

type SettingsModalProps = {
  isOpen: boolean
  close: () => void
  tempo: number
  setTempo: (tempo: number) => void
}

let tapTimes: number[] = []

export default function SettingsModal({ isOpen, close, tempo, setTempo }: SettingsModalProps) {

  const [tempoDisplay, setTempoDisplay] = useState<string>(tempo.toString())

  // This is a bit complicated - Here's what's going on:
  // When the box is clicked on, it's emptied to make ready for typing.
  // When numbers are added, they're tacked onto the end.
  // When the box loses focus or enter is pressed, it sets the tempo.
  // This all because with a managed component it's hard to input stuff.
  const onTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // @ts-ignore -- I don't know why it thinks this isn't in there
    const data: string | null = e.nativeEvent.data
    if (data === null) { return }
    const isNumber = !isNaN(+data)
    if (!isNumber) { return setTempoDisplay(tempo.toString()) }
    setTempoDisplay(tempoDisplay + data)
  }

  const onTap = () => {

    // We're going to average out over 4 taps
    if (tapTimes.length >= 4) { tapTimes.shift() }

    // If the last tap was too long ago, we'll start afresh
    if (Date.now() - tapTimes[tapTimes.length - 1] > 5000) {
      tapTimes = []
    }

    tapTimes.push(Date.now())

    // If it's the first tap, gotta go ahead and wait till the next
    // to do any changes
    if (tapTimes.length === 1) { return }

    const tapDiffs: number[] = tapTimes.map((time, index) => {
      const prevTime = tapTimes[index - 1]

      if (prevTime) {
        return time - prevTime
      } else {
        // If we're at the first tap, we can't count it
        return  null
      }
    }).filter(Boolean) as number[]

    const totalDiff = tapDiffs.reduce((totalDiff, time) => {
      return totalDiff + time
    }, 0)

    const averageDiff = totalDiff / tapDiffs.length

    const seconds = averageDiff / 1000
    const bps = Math.round(60 / seconds)
    setTempoDisplay(bps.toString())
    setTempo(bps)
  }

  return (
    <div id="settings-modal" className={"modal" + (isOpen ? " open" : "")}>
      <div onClick={close} className="close-button button-effects button-sizing">⊗</div>
      <h2 style={{ alignSelf: 'center' }}>Settings</h2>
      <hr />

      <div className="row">
        <h3>Tempo</h3>
        <input
          onClick={() => setTempoDisplay("")}
          onChange={onTempoChange}
          className="tempo-indicator"
          value={tempoDisplay}
          onBlur={() => setTempo(+tempoDisplay)}
          onKeyDown={(e) => { if (e.key === 'Enter') setTempo(+tempoDisplay)}}
        />
        <span onClick={onTap} className="tap-tempo-button">Tap</span>
      </div>
    </div>
  )
}
