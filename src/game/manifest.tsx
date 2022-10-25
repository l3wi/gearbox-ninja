// a melonJS data manifest
// note : this is note a webpack manifest
const DataManifest = [
  { name: "app", type: "tmx", src: "data/map/app.tmx" },
  /* Bitmap Text */
  {
    name: "PressStart2P",
    type: "image",
    src: "data/fnt/PressStart2P.png",
  },
  {
    name: "PressStart2P",
    type: "binary",
    src: "data/fnt/PressStart2P.fnt",
  },
  {
    name: "background_8bit",
    type: "audio",
    src: "data/bgm/",
  },
  {
    name: "tiles",
    type: "image",
    src: "data/img/map/tiles.png",
  },
  {
    name: "start",
    type: "image",
    src: "data/img/start.jpeg",
  },
  {
    name: "pagoda",
    type: "image",
    src: "data/img/pagoda.png",
  },
  {
    name: "underground",
    type: "image",
    src: "data/img/underground.png",
  },
  {
    name: "bg_slice",
    type: "image",
    src: "data/img/map/bg_slice.png",
  },
  {
    name: "ninja-smol",
    type: "image",
    src: "data/img/sprite/ninja-smol.png",
  },
];

export default DataManifest;
