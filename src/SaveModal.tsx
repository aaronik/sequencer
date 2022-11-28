import './SaveModal.scss'
import { useEffect, useRef, useState } from 'react'
import { DbItem } from './types'
import SecretPrompt from './SaveModalSecretPrompt'

function Item({ item }: { item: DbItem }) {
  return (
    <div key={item.id}>{JSON.stringify(item)}</div>
  )
}

type SaveModalBodyProps = {
  dbItems: DbItem[]
  ourDbItem: DbItem
  saveItem: (item: DbItem) => void
}

function SaveModalBody({ dbItems, saveItem, ourDbItem }: SaveModalBodyProps) {
  const nameRef = useRef<HTMLInputElement>(null)

  const saveName = () => {
    const newName = nameRef.current?.value
    if (!newName) { return }
    ourDbItem.name = nameRef.current?.value
    saveItem(ourDbItem)
  }

  return (
    <div id="save-modal-body">
      <h3>Saving under:</h3>
      <div className="input-group" onKeyDown={e => e.stopPropagation()}>
        <input
          placeholder="Your name"
          defaultValue={ourDbItem.name}
          ref={nameRef}
        />
        <button className="button-effects" onClick={saveName}>Update</button>
      </div>
      <hr />
    </div>
  )
}

type SaveModalProps = {
  isOpen: boolean
  close: () => void
  setSecret: (secret: string) => void
  needsSecret: boolean
  numConnections: number
  dbItems: DbItem[]
  ourDbItem: DbItem
  saveItem: (item: DbItem) => void
}

export default function SaveModal(props: SaveModalProps) {
  const [isSecretPromptHidden, setIsSecretPromptHidden] = useState(!props.needsSecret)
  const [isSecretPromptDisplayed, setIsSecretPromptDisplayed] = useState(props.needsSecret)

  // One time, when the secret is input by the user, we'll do this to fade the whole prompt out
  useEffect(() => {
    if (!props.needsSecret) {
      setIsSecretPromptHidden(true)
      setTimeout(() => {
        setIsSecretPromptDisplayed(false)
      }, 300)
    }
  }, [props.needsSecret])

  return (
    <div id="save-modal" className={"modal" + (props.isOpen ? " open" : "")} onClick={e => e.stopPropagation()}>
      <span id="connections-readout">{props.numConnections}</span>
      <div onClick={props.close} className="close-button button-effects button-sizing">⊗</div>
      <h2 style={{ alignSelf: 'center' }}>Save / Load</h2>
      <hr />

      {
        isSecretPromptDisplayed &&
        <SecretPrompt className={isSecretPromptHidden ? "hidden" : ""} setSecret={props.setSecret} />
      }

      {
        isSecretPromptDisplayed ||
        <SaveModalBody dbItems={props.dbItems} ourDbItem={props.ourDbItem} saveItem={props.saveItem} />
      }
    </div>
  )
}
