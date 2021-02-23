import React from "react";

import styled from "styled-components/native";
import { TouchableOpacity, Text, View } from "react-native";
import { TextInput } from "react-native-gesture-handler";

export const StyledText = styled(Text)`
  font-family: Helvetica;
  text-align: center;
  color: white;
  font-size: 25px;
  margin-bottom: 25px;
`;

export const StyledTextInput = styled(TextInput)`
  textalign: center;
  borderradius: 5;
  backgroundcolor: white;
  fontsize: 25;
  color: black;
  width: 30%;
`;

export const StyledTextSmall = styled(StyledText)`
  font-size: 15px;
`;

export const StyledTextLarge = styled(StyledText)`
  font-size: 50px;
`;

export const StyledTouchableOpacity = styled(TouchableOpacity)`
  align-items: center;
`;

export const StyledTouchableOpacityRed = styled(StyledTouchableOpacity)`
  background-color: #d45353;
  width: 300px;
  height: 50px;
  border-radius: 10px;
  border-width: 3px;
  border-color: #d45353;
  justify-content: center;
`;

export const StyledView = styled(View)`
  align-items: center;
`;

export const StyledViewContainer = styled(StyledView)`
  flex: 1;
  justify-content: space-around;
`;

export const StyledViewRow = styled(View)`
  flexdirection: row;
  width: 300px;
  padding: 10px;
`;

export const StyledBackdropDark = styled(View)`
  width: 100%;
  justify-content: center;
  position: absolute;
  right: 0px;
  left: 0px;
  top: 0px;
  bottom: 0px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
`;
