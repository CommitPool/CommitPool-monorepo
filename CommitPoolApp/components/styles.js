import React from "react";

import styled from "styled-components/native";
import { TouchableOpacity, Text, View } from "react-native";

export const StyledText = styled(Text)`
  text-align: center;
  color: white;
  font-size: 25px;
  margin-bottom: 25px;
`;

export const StyledTouchableOpacity = styled(TouchableOpacity)`
  align-items: center;
`;

export const StyledTouchableOpacityRed = styled(TouchableOpacity)`
  width: 300;
  height: 50;
  background-color: #d45353;
  align-items: center;
  justify-content: center;
`;

export const StyledView = styled(View)`
  align-items: center;
`;

export const StyledViewRow = styled(View)`
    flexDirection: row; 
    width: 300; 
    padding: 10;
`;
