import * as React from 'react'
import * as ReactDOM from 'react-dom/client'

import { store } from './store'
import Page from './components/page'
import { Provider } from 'react-redux'

import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
@font-face {
  font-family: 'Press Start 2P';
  src: url('/data/fnt/PressStart2P.woff2') format('woff2'),
    url('/data/fnt/PressStart2P.woff') format('woff');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

body {
  background-color: #202020;
  color: white;

  /* Allow mouse dragging. */
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  -webkit-user-select: none;
  user-select: none;

  /* disable touch panning/zooming */
  -ms-touch-action: none;
  touch-action: none;

  /* Allow canvas to hit the edges of the browser viewport. */
  margin: 0;
  width: 100vw;
  height: 100vh;
}

#screen canvas {
  margin: 0 auto;
  display: block;

  overflow: hidden;
}

`

const App = () => {
  return (
    <Provider store={store}>
      <GlobalStyle />
      <Page />
    </Provider>
  )
}

export default App
