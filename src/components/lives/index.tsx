import { useSelector } from "react-redux";
import styled from "styled-components";
import { RootState } from "../../store/reducer";

const Lives = () => {
  const { account, nftBalance, nftAmount, nftClaimed } = useSelector(
    (state: RootState) => state.web3,
  );
  const CAs = useSelector((state: RootState) => state.creditAccounts.list);
  const stage = useSelector((state: RootState) => state.game.currentStage);
  const lives = nftBalance ? nftBalance : 0;

  const total = nftAmount ? nftAmount : 0;
  if (stage === "PLAY" && account && nftClaimed) {
    return (
      <Container>
        LIVES:
        {nftClaimed
          ? Array(lives)
              .fill("x")
              .map((_, i) => (
                <Life key={"io" + i}>
                  <img src="/data/img/ninja.png" height={64} />
                </Life>
              ))
          : null}
      </Container>
    );
  } else {
    return null;
  }
};

const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 0px 10px;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 1.5rem;
  font-style: normal;
  min-height: 64px;
  @media (max-width: 1200px) {
    font-size: 1rem;
  }
`;

const Life = styled.div`
  padding-left: 10px;
  opacity: 1;
  /* transition: 200ms ease;
  &:hover {
    opacity: 1;
  } */
`;

export default Lives;
