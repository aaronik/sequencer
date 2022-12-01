import './SaveModal.scss'
import { useEffect, useRef, useState } from 'react'
import { DbItem } from './types'
import SecretPrompt from './SaveModalSecretPrompt'
import { GRID_SIZE, TUNINGS } from './constants'

/**
* @description Represents a grid with text only, using little squares.
*/
function MiniGrid({ save }: { save: DbItem['saves'][number] }) {

  const squareMatrix: string[][] = []
  // const whiteSquare = '&#9633;'
  const whiteSquare = '◻'
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
  deleteSave?: (saveId: string) => void
  block: (personId: string) => void
  isOurs: boolean
}

// One row -- a single person, with many saves
function Item({ item, loadSave, deleteSave, block, isOurs }: ItemProps) {

  return (
    <div className="db-item">
      <div className="name-group">
        <h5 className="user-name">{item.name}</h5>
        {isOurs || <h6 className="button-effects block-button" onClick={() => block(item.id)}>Block</h6>}
      </div>
      {item.saves.map(save => {
        return (
          <div key={save.id}>
            <div style={{ justifyContent: 'space-around' }} className="row">
              <h6>{save.name}</h6>
              {!!deleteSave && <button className="delete-button button-effects" onClick={() => deleteSave(save.id)}>⊗</button>}
            </div>
            <div style={{ cursor: 'pointer' }} onClick={() => loadSave(save)}>
              <MiniGrid save={save} />
            </div>
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
  block: (personId: string) => void
}

// TODO
// * Don't allow twice saving of the same grid
// * Loading indicator of some sort for an empty load screen? Although what if nobody has a save?
//   Show loading if there're no connections AND there're no saves.
function SaveModalBody(props: SaveModalBodyProps) {
  const tuneNameRef = useRef<HTMLInputElement>(null)
  const [personName, setPersonName] = useState("")
  const [tuneName, setTuneName] = useState("")
  const [isNameSaveIndicatorShowing, setIsNameSaveIndicatorShowing] = useState(false)
  const [isTuneSaveIndicatorShowing, setIsTuneSaveIndicatorShowing] = useState(false)

  const saveName = () => {
    if (!personName) { return }
    props.ourDbItem.name = personName
    props.saveItem(props.ourDbItem)

    setIsNameSaveIndicatorShowing(true)
    setTimeout(() => {
      setIsNameSaveIndicatorShowing(false)
    }, 3000)
  }

  const serializeAndSaveItem = () => {
    if (!props.ourDbItem) return // TODO on these returns make a red check
    const serialized = props.getSerializedCurrentState()
    serialized.name = tuneName
    props.ourDbItem.saves.push(serialized)
    props.saveItem(props.ourDbItem)
    tuneNameRef.current!.value = ""
    setTuneName("")

    setIsTuneSaveIndicatorShowing(true)
    setTimeout(() => {
      setIsTuneSaveIndicatorShowing(false)
    }, 3000)
  }

  const deleteSave = (saveId: string) => {
    if (!props.ourDbItem) return
    props.ourDbItem.saves = props.ourDbItem.saves.filter(save => save.id !== saveId)
    props.saveItem(props.ourDbItem)
  }

  // Make sure ours is always on top
  const ourIndex = props.dbItems.findIndex(item => item.id === props.ourDbItem.id)
  let dbItems = props.dbItems
  if (ourIndex !== -1) {
    dbItems.splice(ourIndex, 1)
    dbItems.unshift(props.ourDbItem)
  }

  // We don't want to render any that have a name but don't have any saves
  dbItems = dbItems.filter(item => !!item.saves.length)

  // And while we're at it, let's not render any for people that don't have a name,
  // even they have saves.
  dbItems = dbItems.filter(item => !!item.name)

  return (
    <div id="save-modal-body" onKeyDown={e => e.stopPropagation()}>
      <div className="row">
        <h4>Saving under the name:</h4>
        <span style={{ transition: 'opacity: 0.3s', color: 'green' }} className={isNameSaveIndicatorShowing ? "" : "hidden"}>&nbsp;✔</span>
      </div>
      <div className="input-group">
        <input
          placeholder="Your name"
          defaultValue={props.ourDbItem.name}
          onChange={e => setPersonName(e.currentTarget.value)}
        />
        <button className="button-effects" disabled={!personName} onClick={saveName}>Update</button>
      </div>

      <hr />

      <div className="row">
        <h4>Save the current tune as:</h4>
        <span style={{ transition: 'opacity: 0.3s', color: 'green' }} className={isTuneSaveIndicatorShowing ? "" : "hidden"}>&nbsp;✔</span>
      </div>
      <div className="input-group">
        <input
          placeholder="Name this tune"
          maxLength={15}
          ref={tuneNameRef}
          onChange={e => setTuneName(e.currentTarget.value)}
        />
        <button className="button-effects" disabled={!tuneName} onClick={serializeAndSaveItem}>Save</button>
      </div>

      <hr />

      <h4>Load:</h4>

      <div id="load-section">
        {dbItems.map(item => {
          return (
            <Item
              key={item.id}
              item={item}
              loadSave={props.loadSave}
              deleteSave={item.id === props.ourDbItem.id ? deleteSave : undefined}
              block={props.block}
              isOurs={item.id === props.ourDbItem.id}
            />
          )
        })}
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
  block: (personId: string) => void
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
      <div id="left-items" className={props.needsSecret ? "hidden" : ""}>
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
          block={props.block}
        />
      }
    </div>
  )
}
