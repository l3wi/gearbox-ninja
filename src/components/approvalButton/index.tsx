import { Asset } from "@gearbox-protocol/sdk";
import React, { PropsWithChildren, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";

import { ETH_ADDRESS, WETH_ADDRESS } from "../../config/tokens";
import {
  useAllowances,
  useTokenDataWithEth,
  useVirtualTokenAllowances,
} from "../../hooks/useTokens";
import { RootState } from "../../store";
import actions from "../../store/actions";
import { getAllowanceId } from "../../store/tokens";
import { generateNewHash } from "../../utils/opHash";

const defaultSkipApprovals: SkipApprovalList = {
  [WETH_ADDRESS]: true,
  [ETH_ADDRESS]: true,
};

export interface ApproveButtonProps {
  assets: Array<Asset>;
  skipApprovalsFor?: SkipApprovalList;
  to?: string;
  disabled?: boolean;
}

export function ApproveButton({
  assets,
  to,
  disabled,
  children,
  skipApprovalsFor = defaultSkipApprovals,
}: PropsWithChildren<ApproveButtonProps>): React.ReactElement {
  const dispatch = useDispatch();
  const { account } = useSelector((state: RootState) => state).web3;

  const [notApprovedAsset] = useApproveNext(assets, to || "", skipApprovalsFor);
  const { token: tokenAddress } = notApprovedAsset || {};

  const [, pendingTokens] = useVirtualTokenAllowances();
  const { symbol } = useTokenDataWithEth(tokenAddress) || {};

  const onApprove = () => {
    if (to && tokenAddress && account) {
      const opHash = generateNewHash("APPROVE-");
      dispatch(
        // @ts-ignore
        actions.tokens.approveToken({
          tokenAddress,
          to,
          account,
          opHash,
        }),
      );
    }
  };

  return (
    <Guard
      showGuard={!!notApprovedAsset}
      guard={
        <Button onClick={onApprove} disabled={disabled || !to}>
          <>{`Approve ${symbol}`}</>
        </Button>
      }
    >
      <Guard
        showGuard={pendingTokens.length > 0}
        guard={
          <Button disabled>
            <>{`${pendingTokens[0]?.symbol} Pending Approval`}</>
          </Button>
        }
      >
        <>{children}</>
      </Guard>
    </Guard>
  );
}

export type SkipApprovalList = Record<string, true>;

function useApproveNext(
  assets: Array<Asset>,
  to: string,
  skipApprovalList: SkipApprovalList,
) {
  const [virtualAllowances] = useVirtualTokenAllowances();
  const { account } = useSelector((state: RootState) => state).web3;

  const allowances = useAllowances(account, to);

  const notAllowedAsset = useMemo(() => {
    const assetFound = assets.find(({ token: addr, balance: amount }) => {
      const tokenAddress = addr.toLowerCase();
      const id = getAllowanceId(tokenAddress, to);

      const allowance = allowances[id];
      const virtualAllowance = virtualAllowances[id];

      const wrongAllowance = allowance === undefined || allowance?.lt(amount);
      const wrongVirtualAllowance =
        virtualAllowance === undefined || virtualAllowance?.lt(amount);

      return (
        !skipApprovalList[tokenAddress] &&
        wrongAllowance &&
        wrongVirtualAllowance
      );
    });

    return assetFound;
  }, [assets, allowances, to, virtualAllowances, skipApprovalList]);

  return [notAllowedAsset] as const;
}

export interface GuardProps {
  showGuard: boolean;
  guard: React.ReactNode;
}

export function Guard({
  showGuard,
  guard,
  children,
}: React.PropsWithChildren<GuardProps>) {
  return showGuard ? <>{guard}</> : <>{children}</>;
}

interface ButtonProps {
  readonly disabled: boolean;
}

const Button = styled.div<ButtonProps>`
  width: 100%;
  background: gray;
  border: none;
  color: white;
  padding: 15px 0px;
  font-family: "Courier New", Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 14px;
  margin: 0px;
  font-family: "Press Start 2P";
  text-align: center;
`;
