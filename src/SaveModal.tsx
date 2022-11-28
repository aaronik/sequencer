import './SaveModal.scss'
import { generateSecret, validateSecret } from './network'
import { useEffect, useRef, useState } from 'react'

const SECRET_INFO_TEXT =
  `A new secret has been generated. This is like a password -- store it in your favorite
password manager or write it on a sticky note and tape it to your monitor. Press ✔ to continue.
`

const SECRET_ERROR_TEXT = `Sorry, this secret is invalid.`

function SecretPrompt({ setSecret, className }: { className: string, setSecret: SaveModalProps['setSecret'] }) {
  const [text, setText] = useState("")
  const [showText, setShowText] = useState(false)
  const [isError, setIsError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const scheduleTextFade = (seconds: number) => {
    setTimeout(() => {
      setShowText(false)
      setTimeout(() => {
        setText("")
      }, 300)
    }, seconds * 1000)
  }

  const generate = () => {
    const secret = generateSecret()
    inputRef.current!.value = secret
    setText(SECRET_INFO_TEXT)
    setIsError(false)
    setShowText(true)
    scheduleTextFade(30)
  }

  const onSubmit = () => {
    const secret = inputRef.current!.value
    if (!secret) return

    try {
      validateSecret(secret)
    } catch (e) {
      setText(SECRET_ERROR_TEXT)
      setIsError(true)
      setShowText(true)
      scheduleTextFade(5)
      return
    }

    setSecret(secret)
  }

  let explanationClass = ""
  if (isError) explanationClass += " error"
  if (!showText) explanationClass += " hidden"

  return (
    <div id="secret-prompt" className={className}>
      <div className="secret-prompt-row">
        <input ref={inputRef} placeholder="Secret" />
        <button
          id="secret-prompt-submit"
          className="button-effects"
          type="submit"
          onClick={onSubmit}
        >✔</button>
      </div>
      <h3>-- OR --</h3>
      <button id="generate-new-secret" className="button-effects" onClick={generate}>
        Generate New Account Secret
      </button>
      <p id="explanation" className={explanationClass}>
        {text}
      </p>
    </div>
  )
}

type SaveModalProps = {
  isOpen: boolean
  close: () => void
  setSecret: (secret: string) => void
  needsSecret: boolean
}

export default function SaveModal({ isOpen, close, setSecret, needsSecret }: SaveModalProps) {
  const [isSecretPromptHidden, setIsSecretPromptHidden] = useState(!needsSecret)
  const [isSecretPromptDisplayed, setIsSecretPromptDisplayed] = useState(needsSecret)

  // One time, when the secret is input by the user, we'll do this to fade the whole prompt out
  useEffect(() => {
    if (!needsSecret) {
      setIsSecretPromptHidden(true)
      setTimeout(() => {
        setIsSecretPromptDisplayed(false)
      }, 300)
    }
  }, [needsSecret])

  return (
    <div id="save-modal" className={"modal" + (isOpen ? " open" : "")}>
      <div onClick={close} className="close-button button-effects button-sizing">⊗</div>
      <h2 style={{ alignSelf: 'center' }}>Save / Load</h2>
      <hr />

      {
        isSecretPromptDisplayed &&
        <SecretPrompt className={isSecretPromptHidden ? "hidden" : ""} setSecret={setSecret} />
      }
    </div>
  )
}
