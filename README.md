# Gearbox Ninja UI

![melonJS Logo](https://game.gearbox.fi/data/meta.png)

A simple React & MelonJs based app to interact with the Gearbox V2 launch, built with :

- melonJS 2
- React JS
- Styled Components
- Redux
- Wepback 5

## Prerequisites

Ensure you have [Node.js](http://nodejs.org/) installed, then install all the build dependencies in the folder where you cloned the repository :

    $ yarn

## Usage

- `npm run dev` to start the dev server on watch mode at `localhost:9000`.
- `npm run build` to generate a minified, production-ready build, in the `public` folder

## Folder structure

```none
src
├── game 
|    ├── manifest.tsx
|    └── data
|         ├── bgm
|         ├── img
|         └── map
├── store
├── hooks
├── config
├── utils
├── index.tsx
└── index.html
```

- `src`
  - the root folder app
  - The entry file is [index.tsx](src/index.tsx).
  - houses both the webapp and the game
- `src/game`
  - [manifest.js](src/manifest.js) is a list of game asset to be preloaded by melonJS 
- `src/index.html`
  - entry point to the both the game and application
  
- `public`
  - where the production-ready build files will be copied/generated when using `npm run build`

## Questions, need help ?

- Open a github ticket with a clear question or issue 
- contact lewi#3000 on discord
