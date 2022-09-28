import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { RootState } from '../../store/reducer'
import { useSelector, useDispatch } from 'react-redux'

import actions from '../../store/actions'

import Pause from '../pause'
import PoolForm from '../pools'
import StrategyFrom from '../strategy'
import Notification from '../notification'
import Video from '../video'
import { BLOCK_UPDATE_DELAY } from '../../config'
import useLocalStorage from '../../hooks/useLocalStorage'
import { activate, declare } from '../../utils/web3'
import Lives from '../lives'

const Page = () => {
  const isPaused = useSelector((state: RootState) => state.game.isPaused)
  const form = useSelector((state: RootState) => state.form)
  const provider = useSelector((state: RootState) => state.web3.provider)

  const dispatch = useDispatch()
  const [cron, setCron] = useState<number | undefined>()
  useEffect(() => {
    if (provider) {
      if (cron) window.clearInterval(cron)

      const syncTask = () => {
        //@ts-ignore
        dispatch(actions.sync.updateLastBlock(provider))
      }

      syncTask()
      const updateTask = window.setInterval(syncTask, BLOCK_UPDATE_DELAY)

      setCron(updateTask)
    }

    return function syncCleanup() {
      if (cron) {
        clearInterval(cron)
        setCron(undefined)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider?.connection.url])

  return (
    <Layout>
      {/* Paused */}
      {/* Forms */}
      {!form.isHidden && form.type === 'tube' ? <PoolForm /> : null}
      {!form.isHidden && form.type === 'entrance' ? <StrategyFrom /> : null}

      {/* Notification */}
      {isPaused && <Pause />}
      <Lives />
      <Notification />
      <Video />
    </Layout>
  )
}

const Layout = styled.main`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 50;
  font-weight: 800;
  font-family: 'Courier New', Courier, monospace;
`

export default Page
