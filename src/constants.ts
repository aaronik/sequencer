export const GRID_SIZE = 16
export const PROPAGATION_SPEED = 100

export const TUNINGS = {
  maj5: {
    name: 'Major Pentatonic',
    color: 'yellow',
    notes: [
      'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'D6', 'E6', 'G6', 'A6', 'C7'
    ].reverse()
  },
  min5: {
    name: 'Minor Pentatonic',
    color: 'blue',
    notes: [
      'C4', 'D4', 'Eb4', 'G4', 'Bb4', 'C5', 'D5', 'Eb5', 'G5', 'Bb5', 'C6', 'D6', 'Eb6', 'G6', 'Bb6', 'C7'
    ].reverse()
  },
  chin5: {
    name: 'Chinese Pentatonic',
    color: '#00A86B',
    notes: [
      'C4', 'D4', 'F4', 'G4', 'A4', 'C5', 'D5', 'F5', 'G5', 'A5', 'C6', 'D6', 'F6', 'G6', 'A6', 'C7'
    ].reverse()
  },
  jap5: {
    name: 'Japanese Pentatonic',
    color: 'red',
    notes: [
      'C4', 'Db4', 'F4', 'G4', 'Ab4', 'C5', 'Db5', 'F5', 'G5', 'Ab5', 'C6', 'Db6', 'F6', 'G6', 'Ab6', 'C7'
    ].reverse()
  },
  wholetone: {
    name: 'Whole Tone',
    color: 'purple',
    notes: [
      'C4', 'D4', 'E4', 'Gb4', 'Ab4', 'Bb4', 'C5', 'D5', 'E5', 'Gb5', 'Ab5', 'Bb5', 'C6', 'D6', 'E6', 'Gb6'
    ].reverse()
  },
  // phrygdom: {
  //   name: 'Phrygian Dominant',
  //   color: 'darkorange',
  //   notes: [
  //     'C4', 'Db4', 'E4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'Db5', 'E5', 'F5', 'G5', 'Ab5', 'Bb5', 'C6', 'Db6'
  //   ].reverse()
  // },
  // dorian: {
  //   name: 'Dorian',
  //   color: 'teal',
  //   notes: [
  //     'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'Eb5', 'F5', 'G5', 'A5', 'Bb5', 'C6', 'D6'
  //   ].reverse()
  // },
}

