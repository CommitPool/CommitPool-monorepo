import * as React from "react";
import { Image } from "react-native";

import {
  StyledTouchableOpacity,
  StyledText,
  StyledTextLarge,
  StyledView,
  StyledViewContainer,
} from "./components/styles";
export default class Directions extends React.Component<{ next: any, stravaOAuth: any }, {}> {
  render() {
    return (
      <StyledViewContainer>
        <StyledView>
          <StyledText>
            {"Hey there,"}
            {"\n\n"}
            {"You have personal goals, but sticking to them is hard."}
            {"\n"}
            {"CommitPool is here to help you hold yourself accountable! 💪"}
          </StyledText>
          <StyledText>
            {"Here's how it works:"}
            {"\n\n"}
            {"1. Set a goal for yourself"}
            {"\n"}
            {"2. Stake some money on that goal to make it a real commitment"}
            {"\n"}
            {"3. Get going on your goal!"}
            {"\n"}
            {"\n"}
            {"When you complete your goal, you get your money back. 🎉"}
            {"\n"}
            {"But if you come up short of your goal, you lose your stake. 😬"}
          </StyledText>
          <StyledText style={{ fontStyle: "italic" }}>
            {"\n"}
            {'"My goal is to bike 50 miles in the next week'}
            {"\n"}
            {"and I'm staking $10 on my succes\""}
          </StyledText>
        </StyledView>
        <StyledTouchableOpacity onPress={() => this.props.next(2)}>
          <Image
            style={{ width: 100, height: 100 }}
            source={require("./assets/commit.png")}
          />
          <StyledTextLarge style={{ color: "white"}}>
            Ready to commit?
          </StyledTextLarge>
        </StyledTouchableOpacity>
      </StyledViewContainer>
    );
  }
}
