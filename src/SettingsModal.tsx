import { TUNINGS } from './constants'
import './SettingsModal.scss'
import SettingsModalTempoRow from './SettingsModalTempoRow'

type SettingsModalProps = {
  isOpen: boolean
  close: () => void
  tempo: number
  setTempo: (tempo: number) => void
  tuning: keyof typeof TUNINGS
  setTuning: (tuning: keyof typeof TUNINGS) => void
  onClearGrid: () => void
}

export default function SettingsModal({ isOpen, close, tempo, setTempo, tuning: tuningKey, setTuning, onClearGrid }: SettingsModalProps) {

  const generateTuningSelectionStyle = (color: string) => {
    return {
      borderBottom: 'solid 1vmin ' + color
    }
  }

  return (
    <div id="settings-modal" className={"modal" + (isOpen ? " open" : "")} onClick={e => e.stopPropagation()}>
      <div onClick={close} className="close-button button-effects button-sizing">⊗</div>
      <h2 style={{ alignSelf: 'center' }}>Settings</h2>
      <hr />

      <SettingsModalTempoRow tempo={tempo} setTempo={setTempo} />

      <div className="row">
        <h3>Tuning</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {
            (Object.keys(TUNINGS) as (keyof typeof TUNINGS)[]).map(key => {
              const tuning = TUNINGS[key]
              return (
                <div
                  key={key}
                  className={"tuning-selection button-effects" + (key === tuningKey ? ' active' : '')}
                  style={generateTuningSelectionStyle(tuning.color)}
                  onClick={() => setTuning(key)}
                >
                  {
                    tuning.name.split(' ').map(word => {
                      return (
                        <span key={key + word}>{word}</span>
                      )
                    })
                  }
                </div>
              )
            })
          }
        </div>
      </div>

      <div className="row">
        <h3>Clear</h3>
        <button id="clear-grid-button" className="button-effects" onClick={onClearGrid}>
          Clear the grid
        </button>
      </div>
    </div>
  )
}
