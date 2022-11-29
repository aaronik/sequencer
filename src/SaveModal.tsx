import './SaveModal.scss'
import { useEffect, useRef, useState } from 'react'
import { DbItem } from './types'
import SecretPrompt from './SaveModalSecretPrompt'
import { GRID_SIZE, TUNINGS } from './constants'

// Compute a single empty square array at load time for saving
// of compute speed and costing of very little memory


// How to visually represent one of these?
// * Regular old grid of <div>s
//  + Doable
//  - Inefficient - can the browser handle that many? There might be a hundred of these
// * Canvas
//  + Very hard
//  - Still would be tons of canvases. I don't think this is the way.
// * Text
//  + Doable
//  + Easy on the browser
//  - Not trivial to get colors in there, but not terribly hard
function MiniGrid({ save }: { save: DbItem['saves'][number] }) {

  const squareMatrix: string[][] = []
  // const whiteSquare = '&#9633;'
  const whiteSquare = '□'
  // const blackSquare = '&#9632;'
  const blackSquare = '◼'

  for (let i = 0; i < GRID_SIZE; i++) {
    squareMatrix.push([])
    for (let j = 0; j < GRID_SIZE; j++) {
      squareMatrix[i]!.push(whiteSquare)
      if (j === GRID_SIZE - 1) {
        squareMatrix[i].push('\n')
      }
    }
  }

  save.activeGridItems.forEach(item => {
    squareMatrix[item.i][item.j] = blackSquare
  })

  let text = ""
  squareMatrix.forEach(squareArray => {
    text += squareArray.join('')
  })

  // @ts-expect-error // item has a tuning that's a string, which is deliberate, because
  // of how crazy I've been about updating tunings, I'm definitely handling the possibility
  // that the saved tuning is no longer in the tunings object.
  const color = TUNINGS[save.tuning]?.color || 'white'

  return (
    <pre className="mini-grid" style={{ color }}>{text}</pre>
  )
}

type ItemProps = {
  item: DbItem,
  loadSave: (save: DbItem['saves'][number]) => void
}


function Item({ item, loadSave }: ItemProps) {
  return (
    <div className="db-item">
      <h6>{item.name}</h6>
      {item.saves.map(save => {
        return (
          <div style={{ textAlign: 'center', cursor: 'pointer' }} key={save.id} onClick={() => loadSave(save)}>
            <h6>{save.name}</h6>
            <MiniGrid save={save} />
          </div>
        )
      })}
    </div>
  )
}

type SaveModalBodyProps = {
  dbItems: DbItem[]
  ourDbItem: DbItem
  saveItem: (item: DbItem) => void
  getSerializedCurrentState: () => DbItem['saves'][number]
  loadSave: (save: DbItem['saves'][number]) => void
}

// TODO
// * Nice visual indicator for when the name is updated (checkbox next to header?)
function SaveModalBody({ dbItems, saveItem, ourDbItem, getSerializedCurrentState, loadSave }: SaveModalBodyProps) {
  const nameRef = useRef<HTMLInputElement>(null)
  const tuneNameRef = useRef<HTMLInputElement>(null)

  const saveName = () => {
    const newName = nameRef.current?.value
    if (!newName) { return }
    ourDbItem.name = nameRef.current?.value
    saveItem(ourDbItem)
  }

  const serializeAndSaveItem = () => {
    if (!ourDbItem) return
    const serialized = getSerializedCurrentState()
    serialized.name = tuneNameRef.current?.value || ""
    ourDbItem.saves.push(serialized)
    saveItem(ourDbItem)
  }

  return (
    <div id="save-modal-body" onKeyDown={e => e.stopPropagation()}>
      <h4>Saving under the name:</h4>
      <div className="input-group">
        <input
          placeholder="Your name"
          defaultValue={ourDbItem.name}
          ref={nameRef}
        />
        <button className="button-effects" onClick={saveName}>Update</button>
      </div>

      <hr />

      <h4>Save the current tune as:</h4>
      <div className="input-group">
        <input
          placeholder="Name this tune"
          maxLength={15}
          ref={tuneNameRef}
        />
        <button className="button-effects" onClick={serializeAndSaveItem}>Save</button>
      </div>

      <hr />

      <h4>Load:</h4>

      <div id="load-section">
        {dbItems.map(item => <Item key={item.id} item={item} loadSave={loadSave} />)}
      </div>

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
  getSerializedCurrentState: () => DbItem['saves'][number]
  loadSave: (save: DbItem['saves'][number]) => void
  signOut: () => void
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
    } else {
      setIsSecretPromptDisplayed(true)
      setTimeout(() => {
        setIsSecretPromptHidden(false)
      }, 300)
    }
  }, [props.needsSecret])

  return (
    <div id="save-modal" className={"modal" + (props.isOpen ? " open" : "")} onClick={e => e.stopPropagation()}>
      <div id="left-items">
        <span id="sign-out" onClick={props.signOut}>sign out</span>
        <span id="connections-readout">{props.numConnections}</span>
      </div>
      <div onClick={props.close} className="close-button button-effects">⊗</div>
      <h2 style={{ alignSelf: 'center' }}>Save / Load</h2>
      <hr />

      {
        isSecretPromptDisplayed &&
        <SecretPrompt className={isSecretPromptHidden ? "hidden" : ""} setSecret={props.setSecret} />
      }

      {
        isSecretPromptDisplayed ||
        <SaveModalBody
          loadSave={props.loadSave}
          dbItems={props.dbItems}
          ourDbItem={props.ourDbItem}
          saveItem={props.saveItem}
          getSerializedCurrentState={props.getSerializedCurrentState}
        />
      }
    </div>
  )
}
