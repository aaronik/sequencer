import './SettingsButton.scss'

type SettingsButtonProps = {
  onClick: () => void
}

export default function SettingsButton({ onClick }: SettingsButtonProps) {
  return (
    <div id="settings-button" className="button-effects button-sizing" onClick={onClick}>
      <span>⚙</span>
    </div>
  )
}
