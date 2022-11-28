import type Network from '@browser-network/network'
import type { generateSecret as GenerateSecret } from '@browser-network/crypto'
import type { derivePubKey as DerivePubKey } from '@browser-network/crypto'
import type Db from '@browser-network/database'
// import { AsteroidsMessage, MultiPlayerGameData } from './types'

const Net = require('@browser-network/network/umd/network').default as typeof Network
const { generateSecret: genSec } = require('@browser-network/crypto/umd/crypto') as { generateSecret: typeof GenerateSecret }
const { derivePubKey: derivPub } = require('@browser-network/crypto/umd/crypto') as { derivePubKey: typeof DerivePubKey }
const Database = require('@browser-network/database/umd/db').default as typeof Db

export const generateSecret = genSec
export const validateSecret = (secret: string) => {
  derivPub(secret) // This will throw if wrong
}

export const buildNetworkAndDb = (secret: string): [Network, Db<{}>] => {
  const network = new Net({
    secret: secret,
    networkId: 'aaroniks-sequencer-iauyria8y23oirahlaiu3',
    switchAddress: 'https://switchboard.aaronik.com'
  })

  const db = new Database<{}>({
    network: network,
    secret: secret,
    appId: 'sequencer-db'
  })

  return [network, db]
}

