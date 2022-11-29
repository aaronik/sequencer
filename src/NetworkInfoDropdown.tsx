import type Network from '@browser-network/network'
import { useEffect, useState } from 'react'

const IconSvg = ({ style }: { style: React.CSSProperties }) => {
  const containerStyle = Object.assign({
    width: '1.5rem',
    heigh: '1.5rem'
  }, style)

  const pathStyle = {
    fill: 'none',
    stroke: '#FFF',
    strokeWidth: 1,
    strokeLineCap: 'round',
    strokeLineJoin: 'round',
    strokeMiterLimit: 1
  }

  return (
    <svg version="1.1" style={containerStyle} xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 32 32" >
      <line style={pathStyle} x1="16" y1="17" x2="16" y2="20" />
      <polyline style={pathStyle} points="14,21 16,19.8 18,21 " />
      <path style={pathStyle} d="M17.3,8.6c0,1,0.6,1.8,1.6,2.1c1.1,0.3,1.9,1.2,2.2,2.3l-10,0c0.2-1.1,1.1-2,2.1-2.3c0.9-0.3,1.6-1.1,1.6-2.1v0
	"/>
      <path style={pathStyle} d="M16,9L16,9c-1.1,0-2-0.9-2-2V5c0-1.1,0.9-2,2-2h0c1.1,0,2,0.9,2,2v2C18,8.1,17.1,9,16,9z" />
      <path style={pathStyle} d="M25.3,24.6c0,1,0.6,1.8,1.6,2.1c1.1,0.3,1.9,1.2,2.2,2.3l-10,0c0.2-1.1,1.1-2,2.1-2.3c0.9-0.3,1.6-1.1,1.6-2.1
	v0"/>
      <path style={pathStyle} d="M24,25L24,25c-1.1,0-2-0.9-2-2v-2c0-1.1,0.9-2,2-2h0c1.1,0,2,0.9,2,2v2C26,24.1,25.1,25,24,25z" />
      <path style={pathStyle} d="M9.3,24.6c0,1,0.6,1.8,1.6,2.1c1.1,0.3,1.9,1.2,2.2,2.3L3,29c0.2-1.1,1.1-2,2.1-2.3c0.9-0.3,1.6-1.1,1.6-2.1v0"
      />
      <path style={pathStyle} d="M8,25L8,25c-1.1,0-2-0.9-2-2v-2c0-1.1,0.9-2,2-2h0c1.1,0,2,0.9,2,2v2C10,24.1,9.1,25,8,25z" />
    </svg>
  )
}

type NetworkInfoDropdownProps = {
  network: Network,
  styleOverrides?: React.CSSProperties
}

const startTime = Date.now()

export default function NetworkInfoDropdown(props: NetworkInfoDropdownProps) {
  const { network, styleOverrides } = props

  const [numConnections, setNumConnections] = useState(0)
  const [numOutgoingMessages, setNumOutgoingMessages] = useState(0)
  const [numIncomingMessages, setNumIncomingMessages] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [upTime, setUpTime] = useState(0)

  // Start uptime ticker
  useEffect(() => {
    setInterval(() => {
      setUpTime(Math.round((Date.now() - startTime) / 1000))
    }, 1000)
  }, [])

  // This allows for easy(ish) network event handlers. In this one case, React does not
  // IMO make it easy.
  type OnParams = Parameters<typeof network.on>
  const useNetworkEvent = (name: OnParams[0], handler: OnParams[1]) => {
    useEffect(() => {
      network.on(name, handler)
      return () => network.removeListener(name, handler)
    })
  }

  // @ts-expect-error
  useNetworkEvent('add-connection', () => setNumConnections(network.activeConnections.length))
  // @ts-expect-error
  useNetworkEvent('destroy-connection', () => setNumConnections(network.activeConnections.length))
  // @ts-expect-error
  useNetworkEvent('message', () => setNumIncomingMessages(numIncomingMessages + 1))
  // @ts-expect-error
  useNetworkEvent('broadcast-message', () => setNumOutgoingMessages(numOutgoingMessages + 1))

  const dropdownStyle = Object.assign({
    position: 'absolute',
    right: '1vw',
    top: '1vw',
    borderRadius: '1.5rem',
    backgroundColor: 'dimgrey',
    opacity: '0.5',
    padding: '1rem 2rem',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    fontSize: '1rem'
  } as const, styleOverrides)

  return (
    <div style={dropdownStyle} onClick={() => setIsOpen(!isOpen)}>
      <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%', userSelect: 'none' }}>
        <IconSvg style={{ marginRight: '0.2rem', marginLeft: 'auto' }} />
        <code style={{ marginRight: 'auto' }}> | {numConnections}</code>
      </div>
      <div style={{ display: isOpen ? 'block' : 'none' }}>
        <hr />
        <code><a target='_blank' href='https://github.com/browser-network/network#readme'>Browser Network</a></code>
        <hr />
        <code>uptime: {upTime}s</code>
        <hr />
        <code>us: {network.address.slice(0, 7) + '...'}</code>
        <hr />
        <code>connections:</code>
        {network.activeConnections.map((con) => {
          return <code style={{ display: 'block' }} key={con.id}>{con.address?.slice(0, 11) + '...'}</code>
        })}
        <hr />
        <code>messages:</code>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <code>{numIncomingMessages}</code>
          <code style={{ fontSize: '1.5rem' }}>&#8651;</code>
          <code>{numOutgoingMessages}</code>
        </div>
      </div>
    </div>
  )
}

