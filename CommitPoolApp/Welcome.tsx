import * as React from "react";
import { StyleSheet, Image, Dimensions } from "react-native";

import {
  StyledTouchableOpacity,
  StyledText,
  StyledTextLarge,
  StyledView,
  StyledViewContainer,
} from "./components/styles";
export default class Welcome extends React.Component<{ next: any }, {}> {


  constructor(props) {
    super(props);
    this.state = {
      height: 300,
      width: 300,
    };
  }

  updateDimensions() {
      const { width, height } = Dimensions.get("window")
      this.setState({ width: width, height: height });

    }

    componentDidMount() {
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions.bind(this));
    }

/**
 * Remove event listener
 */
  componentWillUnmount() {
      window.removeEventListener("resize", this.updateDimensions.bind(this));
    }


  render() {
    return (
      <StyledViewContainer style={[styles.flexAll, {height: this.state.height}, {width: this.state.width}]}>
        <StyledView>

          <StyledText style={{ fontStyle: "italic" }}>
            {"\n"}
            {''}
            {"\n"}
          </StyledText>
        </StyledView>

        <StyledViewContainer style={styles.flexIcons}>
          <StyledTouchableOpacity onPress={() => this.props.next(2)}>
            <Image
              style={{ width: 100, height: 100 }}
              source={require("./assets/commit.png")}
            />
            <StyledTextLarge style={{ color: "white"}}>
              Start a Commitment
            </StyledTextLarge>
          </StyledTouchableOpacity>

          <StyledTouchableOpacity onPress={() => this.props.next(3)}>
            <Image
              style={{ width: 100, height: 100 }}
              source={require("./assets/directions.png")}
            />
            <StyledTextLarge style={{ color: "white"}}>
              Need help?
            </StyledTextLarge>
          </StyledTouchableOpacity>
          </StyledViewContainer>
      </StyledViewContainer>
    );
  }
}

const styles = StyleSheet.create({
  flexIcons: {
    //flex: 1,
    alignItems: "center",
    backgroundColor: "#d45454",
    //width = {state.width},
    //height = {state.height},
    //alignSelf: 'stretch',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'space-around',
  },
});

const styleAll = StyleSheet.create({
  flexAll: {
    //flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d45454",
    //width = {state.width},
    //height = {state.height},
    //alignSelf: 'stretch',
    flexWrap: 'wrap',
  },
});
