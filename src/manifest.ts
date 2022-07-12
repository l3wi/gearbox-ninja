// a melonJS data manifest
// note : this is note a webpack manifest
const DataManifest = [
  { name: 'area01', type: 'tmx', src: 'data/map/area01.tmx' },
  { name: 'area02', type: 'tmx', src: 'data/map/area02.tmx' },
  /* Bitmap Text */
  {
    name: 'PressStart2P',
    type: 'image',
    src: 'data/fnt/PressStart2P.png'
  },
  {
    name: 'PressStart2P',
    type: 'binary',
    src: 'data/fnt/PressStart2P.fnt'
  },
  {
    name: 'area01_level_tiles',
    type: 'image',
    src: 'data/img/map/area01_level_tiles.png'
  },
  {
    name: 'gripe_run_right',
    type: 'image',
    src: 'data/img/sprite/gripe_run_right.png'
  }
]

export default DataManifest
