import * as React from "react";
import { Image } from "react-native";
import {
  StyledTouchableOpacity,
  StyledText,
  StyledTextLarge,
  StyledView,
  StyledViewContainer,
} from "./components/styles";
export default class Login extends React.Component<
  { stravaOAuth: any; next: any },
  {}
> {
  render() {
    return (
      <StyledViewContainer>
        <StyledView>
          <Image
            style={{ width: 200, height: 200 }}
            source={require("./assets/commit.png")}
          />
          <StyledTextLarge style={{ margin: 25 }}>
            Login to Strava
          </StyledTextLarge>

          <StyledText>
            To track your progress and verify that you've met your goal, we rely
            on activity data that you share with Strava.
            {"\n\n\n"}
          </StyledText>
          <StyledText>Connect your Strava account below.</StyledText>
        </StyledView>
        <StyledTouchableOpacity onPress={this.props.stravaOAuth}>
          <Image
            style={{
              width: 300,
              height: 50,
              borderRadius: 10,
              borderWidth: 5,
              borderColor: "#fff",
              backgroundColor: "#fff",
            }}
            source={require("./assets/strava.svg")}
          />
        </StyledTouchableOpacity>
      </StyledViewContainer>
    );
  }
}
