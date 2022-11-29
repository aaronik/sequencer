import './SaveButton.scss'

type SaveButtonProps = {
  onClick: () => void
}

export default function SaveButton({ onClick }: SaveButtonProps) {
  return (
    <div id="save-button" className="button-effects button-sizing" onClick={onClick}>
      <img src="save.png"/>
    </div>
  )
}
