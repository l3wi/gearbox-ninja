// a melonJS data manifest
// note : this is note a webpack manifest
const DataManifest = [
  { name: 'app', type: 'tmx', src: 'data/map/app.tmx' },
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
    name: 'tiles',
    type: 'image',
    src: 'data/img/map/tiles.png'
  },
  {
    name: 'pagoda',
    type: 'image',
    src: 'data/img/pagoda.png'
  },
  {
    name: 'underground',
    type: 'image',
    src: 'data/img/underground.png'
  },
  {
    name: 'ninja-smol',
    type: 'image',
    src: 'data/img/sprite/ninja-smol.png'
  }
]

export default DataManifest
