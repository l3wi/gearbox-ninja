import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";

import { RootState } from "../../store/reducer";

const Notification = () => {
  const notification = useSelector(
    (state: RootState) => state.game.notification
  );

  return <Note>{notification && notification.value}</Note>;
};

const Note = styled.h1`
  transition: visibility 0.3s linear, opacity 0.3s linear;
  opacity: 1;
  font-family: "Press Start 2P";
  font-weight: 500;
  font-size: 2rem;
  font-style: normal;
  position: fixed;
  z-index: 30;
  bottom: 0px;
  right: 10px;
`;

export default Notification;
