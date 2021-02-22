import React from "react";

import styled from "styled-components/native";
import { Dimensions, TouchableOpacity, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

const { width, height } = Dimensions.get("window");

export const StyledLinearGradient = styled(LinearGradient)`
  flex: 1;
  align-items: center;
  justify-content: center;
  ${width},
  ${height},
  borderRadius: 5,
`;
