import {
  LEVERAGE_DECIMALS,
  TokenBalance,
  TokenData,
} from "@gearbox-protocol/sdk";
import { BigNumber, BigNumberish } from "ethers";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { AssetWithView } from "../../config/asset";
import { bnToFloat, nFormatter } from "../../utils/format";

const sortBalanceByAddress = (
  tokens: string[],
  balances: { [x: string]: BigNumberish },
  tokensList: Record<string, TokenData>
) => {
  return tokens
    .filter((i) => tokensList[i])
    .sort(
      (a, b) =>
        bnToFloat(balances[a], tokensList[a].decimals) -
        bnToFloat(balances[b], tokensList[b].decimals)
    )
    .reverse();
};

const Picker: React.FC<{
  selected: AssetWithView[];
  allowedTokens: string[];
  balances: { [x: string]: BigNumberish };
  tokensList: Record<string, TokenData>;
  addAsset: (tokenAddress: string) => void;
}> = ({ selected, allowedTokens = [], balances, tokensList, addAsset }) => {
  const list = allowedTokens.filter(
    (item) => !selected.map((i) => i.token).includes(item)
  );

  return (
    <Container>
      <List>
        {sortBalanceByAddress(list, balances, tokensList).map((item) => {
          const token = tokensList[item];
          return (
            <Item
              onClick={() => addAsset(token.address)}
              key={"list-" + token.symbol}
            >
              <Row>
                <img src={token.icon} width="20" />
                <div style={{ paddingLeft: 5 }}>{token.symbol}</div>
              </Row>
              <div>
                {nFormatter(balances[token.address], token.decimals, 2)}
              </div>
            </Item>
          );
        })}
      </List>
    </Container>
  );
};

const Container = styled.div`
  position: absolute;
  z-index: 200;
  width: 100%;
  max-width: 300px;
  padding: 20px 30px;
  background-color: black;
`;
const List = styled.div`
  width: 100%;
  max-height: 400px;
  overflow-y: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px 5px;
`;

const Row = styled.span`
  display: flex;
  align-items: center;
`;
const Col = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background-color: #070b13;
  z-index: 200;
`;

export default Picker;
