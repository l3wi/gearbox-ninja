import React, { RefObject, useState } from 'react'
import styled, { keyframes } from 'styled-components'

const Video = () => {
  const [visible, setVisible] = useState(true)
  const videoRef: any = React.createRef()

  const hide = () => {
    setVisible(false)
    videoRef.current.pause()
  }

  return (
    <Container visible={visible}>
      <VideoContainer
        playsInline
        autoPlay
        ref={videoRef}
        onEnded={() => hide()}
      >
        <source src="/data/intro.webm" type="video/webm" />
      </VideoContainer>
      <Skip onClick={() => hide()}>Skip</Skip>
    </Container>
  )
}

const VideoContainer = styled.video`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`

const Skip = styled.button`
  font-family: 'Press Start 2P';
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  position: fixed;
  z-index: 30;
  bottom: 20px;
  right: 20px;
  color: white;
  background: none;
  border: none;
`

const fadeOut = keyframes`
  from {
    opacity: 1;
    visibility: visible;
  }

  to {
    opacity: 0;
    visibility: hidden;
  }
`

const Container = styled.div<{ visible: boolean }>`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
  animation: ${(props) => !props.visible && fadeOut} 1s ease-out;
  transition: visibility 1s linear;
  background: black;
`

export default Video
