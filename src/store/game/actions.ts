import { GameThunkAction } from './index'

import { Stages } from './reducer'

import {
  audio,
  loader,
  state,
  video,
  input,
  pool
} from 'melonjs/dist/melonjs.module.js'

import TitleScreen from '../../game/stage/title'
import PlayScreen from '../../game/stage/play'
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
      store.dispatch(actions.game.ChangeScreen('LOADING'))

      loader.preload(DataManifest, function () {
        // Set default state transition
        state.transition('fade', '#000', 250)

        // Register Stages into the game
        store.dispatch(actions.game.RegisterScreen('MENU', new TitleScreen()))
        store.dispatch(actions.game.RegisterScreen('PLAY', new PlayScreen()))

        // add our player entity in the entity pool
        pool.register('mainPlayer', PlayerEntity)
        // pool.register('CoinEntity', CoinEntity)
        // pool.register('EnemyEntity', EnemyEntity)

        store.dispatch(actions.game.ChangeScreen('MENU'))
      })
    } catch (e: any) {
      alert('Error : ' + e)
    }
  }

export const ChangeScreen =
  (key: keyof Stages, keepPos?: boolean): GameThunkAction =>
  async (dispatch, getState) => {
    try {
      const { stages, currentStage } = getState().game
      if (!stages[key]) return console.error("Error: Stage doesn't exist")

      // If PLAY & keepPos, save player pos
      if (currentStage === 'PLAY' && keepPos) {
        //@ts-ignore
        const position = PlayerEntity.getAbsolutePosition()
        console.log(position)

        dispatch({
          type: 'CHANGE_STAGE',
          payload: { currentStage: key, lastPosition: { x: 0, y: 0 } }
        })
        //@ts-ignore
        state.change(state[key], false) // pls fix
      } else {
        //@ts-ignore
        state.change(state[key], false) // pls fix
      }
    } catch (e: any) {
      console.error('Error : ' + e)
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
