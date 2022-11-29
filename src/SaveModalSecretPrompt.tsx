import './SaveModalSecretPrompt.scss'

import { useRef, useState } from "react"
import { generateSecret, validateSecret } from './network'

const SECRET_INFO_TEXT =
  `This is an algorithmically generated secret that's used to create the address space
  under which you save, load, and share your creations. It costs no money, is instant,
  and is done right here in the app. This is possible via the amazing (ahem) `

const SECRET_SUCCESS_TEXT =
  `A new secret has been generated. This is like a password -- store it in your favorite
password manager or write it on a sticky note and tape it to your monitor. Press ✔ to continue.
`

const SECRET_ERROR_TEXT = `Sorry, this secret is invalid.`

export default function SecretPrompt({ setSecret, className }: { className: string, setSecret: (secret: string) => void }) {
  const [text, setText] = useState(SECRET_INFO_TEXT)
  const [showText, setShowText] = useState(true)
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
    setText(SECRET_SUCCESS_TEXT)
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
        { /* The form and label are required for the browser to remember the secret */}
        <form name="secret-form" id="secret-form" method="GET" action="" onSubmit={e => e.preventDefault()}>
          <label htmlFor="secret">Secret:</label>
          <input
            id="secret-button-input"
            name="secret"
            type="text"
            autoComplete="password"
            ref={inputRef}
            placeholder="Add your existing secret"
          />
          <button
            id="secret-prompt-submit"
            className="button-effects"
            type="submit"
            onClick={onSubmit}
          >✔</button>
        </form>
      </div>
      <h3>-- OR --</h3>
      <button id="generate-new-secret" className="button-effects" onClick={generate}>
        Generate secret for new account
      </button>
      <p id="explanation" className={explanationClass}>
        {text}
        {text === SECRET_INFO_TEXT && <a href="https://github.com/browser-network/database" target="_blank" rel="noreferrer">Browser Network</a>}
      </p>
    </div>
  )
}


