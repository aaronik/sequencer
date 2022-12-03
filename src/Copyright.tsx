export default function() {
  const currentYear = (new Date()).getUTCFullYear()
  const isDiffYear = currentYear !== 2022

  const style = {
    fontSize: 'xx-small',
    position: 'absolute',
    bottom: 0,
    right: 0,
    filter: 'brightness(0.3)'
  } as const

  return (
    <span id="copyright" style={style}>
      {isDiffYear && "copyright © Aaronik 2022-" + currentYear}
      {isDiffYear || "copyright © Aaronik 2022"}
    </span>
  )
}
