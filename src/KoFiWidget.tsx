import React, { useEffect } from "react"

type KoFiWidgetProps = {

}

export default function KoFiWidget({ }: KoFiWidgetProps) {

  // I acknowledge that this is weird but I'm kind of rushing and it works just fine.
  useEffect(() => {
    // @ts-ignore
    window.kofiWidgetOverlay?.draw('aaron_creates', {
      'type': 'floating-chat',
      'floating-chat.donateButton.text': 'Support me!',
      'floating-chat.donateButton.background-color': '#181818',
      'floating-chat.donateButton.text-color': '#AAA',
      'floating-chat.core.position.bottom-left': 'position: fixed; bottom: 50px; left: 10px; width: 160px; height: 65px;',
      'floating-chat.donatebutton.image':'kofi-cup.png',
    })
  }, [])

  return (
    <React.Fragment>
    </React.Fragment>
  )
}
