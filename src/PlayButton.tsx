import './PlayButton.css'

type PlayButtonProps = {
  isPlaying: boolean
  onClick: () => void
}

export default function PlayButton({ isPlaying, onClick }: PlayButtonProps) {
  return (
    <div id="play-button" onClick={onClick}>
      {<div id="play-triangle" className={isPlaying ? "hidden" : ""}></div>}
      {<div id="stop-square" className={isPlaying ? "" : "hidden"}></div>}
    </div>
  )
}

