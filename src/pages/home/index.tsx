import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import ExitButton from "../../components/exitButton";
import { store } from "../../store";
import actions from "../../store/actions";
import { RootState } from "../../store/reducer";

const HomePage = () => {
  const [index, setIndex] = useState(0);

  const playRef = useRef();
  const discordRef = useRef();
  const docRef = useRef();

  // @ts-ignore
  function downHandler({ key }) {
    if (key === "ArrowDown") {
      if (index !== 2) setIndex(index + 1);
    } else if (key === "ArrowUp") {
      if (index !== 0) setIndex(index - 1);
    } else if (key === "Enter") {
      handleClick();
    }
  }

  const handleClick = (i?: number) => {
    switch (i ? i : index) {
      case 0:
        store.dispatch(actions.game.ChangeStage("PLAY"));
        break;
      case 1:
        window.open("https://discord.com/invite/gearbox", "_blank");
        break;
      case 2:
        window.open("https://docs.gearbox.finance/", "_blank");
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
    };
  });

  useEffect(() => {
    switch (index) {
      case 0:
        // @ts-ignore
        playRef.current.focus();
        break;
      case 1:
        // @ts-ignore
        discordRef.current.focus();
        break;
      case 2:
        // @ts-ignore
        docRef.current.focus();
        break;
      default:
        break;
    }
  }, [index]);

  return (
    <FormBg>
      <Underground>
        {/* <ExitButton text="Back" func={exit} /> */}
        <Buttons>
          <Title
            ref={playRef}
            onMouseEnter={() => setIndex(0)}
            onClick={() => handleClick(0)}
            autoFocus
          >
            Play Game
          </Title>
          <Text
            ref={discordRef}
            onMouseEnter={() => setIndex(1)}
            onClick={() => handleClick(1)}
          >
            Join Discord
          </Text>
          <Text
            ref={docRef}
            onMouseEnter={() => setIndex(2)}
            onClick={() => handleClick(2)}
          >
            Documentation
          </Text>
        </Buttons>
      </Underground>
    </FormBg>
  );
};

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 200px;
  justify-content: space-around;
`;
const Title = styled.button`
  width: fit-content;
  background-color: transparent;
  border: transparent;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 60px;
  font-style: normal;
  color: white;
  &:focus {
    color: #82a6f7;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
    outline: none;
  }
  &:hover {
    color: #82a6f7;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
  }
`;
const Text = styled.button`
  width: fit-content;
  background-color: transparent;
  border: transparent;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  color: white;

  &:focus {
    color: #82a6f7;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
    outline: none;
  }
  &:hover {
    color: #82a6f7;
    text-shadow: -1px 0 white, 0 1px white, 1px 0 white, 0 -1px white;
  }
`;
const Underground = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 1024px;
  min-height: 512px;
  /* max-width: calc(100vh * 2);
  max-height: calc(100vw / 2); */
  width: 100%;
  height: 100%;
  background-image: url("/data/img/home.png");
  background-repeat: no-repeat;
  background-position: center;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;
  aspect-ratio: 2 / 1;
`;

const FormBg = styled.div`
  height: 100%;
  width: 100%;
  background: #112951;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export default HomePage;
