import { BigNumber, BigNumberish } from "ethers";
import React from "react";
import styled from "styled-components";

interface SufficientAmountGuardProps {
  amount: BigNumber | undefined;
  balance: BigNumberish | undefined;
}

export function SufficientAmountGuard({
  amount,
  balance,
  children,
}: React.PropsWithChildren<SufficientAmountGuardProps>) {
  const bn = BigNumber.from(balance);
  return (
    <Guard
      showGuard={!bn || bn.lt(amount) || bn.isZero() || bn.isNegative()}
      guard={<Button disabled>insufficient funds</Button>}
    >
      {children}
    </Guard>
  );
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
  padding: 15px 8px;
  font-family: "Courier New", Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 14px;
  margin: 0px;
  font-family: "Press Start 2P";
  text-align: center;
`;
