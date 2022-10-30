import React from "react";
import styled from "styled-components";

interface ErrorButtonGuardProps {
  errorString: string | null | undefined;
}

export function ErrorButtonGuard({
  errorString,
  children,
}: React.PropsWithChildren<ErrorButtonGuardProps>) {
  const showGuard = !!errorString;

  return (
    <Guard
      showGuard={showGuard}
      guard={
        <Button disabled>
          <>{`${errorString}`}</>
        </Button>
      }
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
  padding: 15px 0px;
  font-family: "Courier New", Courier, monospace;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 14px;
  margin: 0px;
  font-family: "Press Start 2P";
  text-align: center;
`;
