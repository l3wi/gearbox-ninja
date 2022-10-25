import { createRef, useState } from "react";
import styled, { keyframes } from "styled-components";

const Video = () => {
  const [mute, setMute] = useState(true);

  const [visible, setVisible] = useState(true);
  const videoRef: any = createRef();

  const unmute = () => {
    setMute(!mute);
  };

  const hide = () => {
    videoRef.current.pause();
    setVisible(false);
  };

  return (
    <Container visible={visible}>
      <VideoContainer
        playsInline
        autoPlay
        muted={mute}
        ref={videoRef}
        onEnded={() => hide()}
      >
        <source src="/data/intro.mp4" type="video/mp4" />
      </VideoContainer>
      <ButtonContainer>
        {mute && <Mute onClick={() => unmute()}>Unmute</Mute>}
        <Button onClick={() => hide()}>Skip</Button>
      </ButtonContainer>
    </Container>
  );
};

const VideoContainer = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  position: fixed;
  z-index: 30;
  bottom: 20px;
  width: 100%;
  right: 0px;
`;
const Mute = styled.button`
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
`;
const Button = styled.button`
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: white;
  background: none;
  border: none;
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
    visibility: visible;
  }

  to {
    opacity: 0;
    visibility: hidden;
  }
`;

const Container = styled.div<{ visible: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  opacity: 1;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  animation: ${(props) => !props.visible && fadeOut} 1s ease-out;
  transition: visibility 1s linear;
  background: black;
`;

export default Video;
