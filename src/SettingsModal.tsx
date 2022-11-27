import './SettingsModal.scss'
import SettingsModalTempoRow from './SettingsModalTempoRow'

type SettingsModalProps = {
  isOpen: boolean
  close: () => void
  tempo: number
  setTempo: (tempo: number) => void
}

export default function SettingsModal({ isOpen, close, tempo, setTempo }: SettingsModalProps) {

  return (
    <div id="settings-modal" className={"modal" + (isOpen ? " open" : "")}>
      <div onClick={close} className="close-button button-effects button-sizing">⊗</div>
      <h2 style={{ alignSelf: 'center' }}>Settings</h2>
      <hr />

      <SettingsModalTempoRow tempo={tempo} setTempo={setTempo} />
    </div>
  )
}
