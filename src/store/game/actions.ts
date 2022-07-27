import { GameThunkAction } from './index'
import { Stages } from './reducer'

import {
  audio,
  loader,
  state,
  video,
  input,
  game,
  pool,
  Vector2d
} from 'melonjs/dist/melonjs.module.js'

import TitleScreen from '../../game/stage/title'
import PlayScreen from '../../game/stage/play'
import Web3Screen from '../../game/stage/web3'
import LoadingScreen from '../../game/stage/loading'
import PlayerEntity from '../../game/renderables/player'
import DataManifest from '../../game/manifest'

import { store } from '../index'
import actions from '../actions'

export const InitGame =
  (w: number, h: number): GameThunkAction =>
  async (dispatch, getState) => {
    console.log('Initializing Game')
    try {
      // initialize the display canvas once the device/browser is ready
      video.init(1024, 512, {
        parent: 'screen',
        scale: 'auto',
        scaleMethod: 'flex-width'
      })

      // Initialize the audio.
      audio.init('mp3,ogg')

      // Load & Init the loading screen
      store.dispatch(
        actions.game.RegisterScreen('LOADING', new LoadingScreen())
      )
      store.dispatch(actions.game.ChangeStage('LOADING'))

      loader.preload(DataManifest, function () {
        // Set default state transition
        state.transition('fade', '#000', 250)

        // Register Stages into the game
        store.dispatch(actions.game.RegisterScreen('MENU', new TitleScreen()))
        store.dispatch(actions.game.RegisterScreen('PLAY', new PlayScreen()))
        store.dispatch(actions.game.RegisterScreen('CREDITS', new Web3Screen()))

        // add our player entity in the entity pool
        pool.register('mainPlayer', PlayerEntity)

        store.dispatch(actions.game.ChangeStage('MENU'))
      })
    } catch (e: any) {
      alert('Error : ' + e)
    }
  }

export const ChangeStage =
  (key: keyof Stages, pos?: { x: number; y: number }): GameThunkAction =>
  async (dispatch, getState) => {
    try {
      const { stages, currentStage, lastPosition } = getState().game
      if (!stages[key]) return console.error("Error: Stage doesn't exist")

      // If PLAY & pos, save player pos
      if (currentStage === 'PLAY' && pos) {
        //@ts-ignore
        state.change(state[key], false) // pls fix
        dispatch({
          type: 'CHANGE_STAGE',
          payload: { currentStage: key, lastPosition: { x: pos.x, y: pos.y } }
        })
      } else {
        //@ts-ignore
        state.change(state[key], false) // pls fix
        dispatch({
          type: 'CHANGE_STAGE',
          payload: { currentStage: key }
        })
      }
    } catch (e: any) {
      console.error('Error : ' + e)
    }
  }

export const BeginStage = (): GameThunkAction => async (dispatch, getState) => {
  try {
    const { lastPosition } = getState().game
    const player = pool.pull('mainPlayer', lastPosition.x, lastPosition.y, {
      name: 'mainPlayer',
      framewidth: 64,
      image: 'ninja_left',
      anchorPoint: new Vector2d(0, 0)
    })

    // @ts-ignore
    game.world.addChild(player, 1)
  } catch (e: any) {
    alert('Error : ' + e)
  }
}

export const RegisterScreen =
  (key: any, stage: any): GameThunkAction =>
  async (dispatch, getState) => {
    try {
      //@ts-ignore
      state.set(state[key], stage) // pls fix
      dispatch({ type: 'REGISTER_STAGE', payload: { key, stage } })
    } catch (e: any) {
      alert('Error : ' + e)
    }
  }
export const PauseGame = (): GameThunkAction => async (dispatch, getState) => {
  try {
    const { isPaused } = getState().game
    if (isPaused) {
      state.resume() // pls fix
      dispatch({ type: 'RESUME_GAME' })
    } else {
      state.pause() // pls fix
      dispatch({ type: 'PAUSE_GAME' })
    }
  } catch (e: any) {
    alert('Error : ' + e)
  }
}
