import * as React from "react";
import { Image} from "react-native";
import { StyledTouchableOpacity, StyledText, StyledView } from "./components/styles";
export default class Login extends React.Component<
  { stravaOAuth: any; next: any; },
  {}
> {
  render() {
    return (
        <StyledView
          style={{
            flex: 1,
            justifyContent: "space-around",
          }}
        >
          <StyledView>
            <Image
              style={{ width: 200, height: 200 }}
              source={require("./assets/commit.png")}
            />
            <StyledText style={{ fontSize: 50 , marginTop: 15}}>
              Login to Strava 
            </StyledText>

            <StyledText>
              To track your progress and verify that you've met your goal, we rely on activity data that you share with Strava. 
              {"\n"}
            </StyledText>
            <StyledText>
              Connect your Strava account below.
            </StyledText>
          </StyledView>
          <StyledTouchableOpacity onPress={this.props.stravaOAuth}>
            <Image
              style={{ width: 300, height: 50 }}
              source={require("./assets/strava.svg")}
            />
          </StyledTouchableOpacity>
        </StyledView>
    );
  }
}
