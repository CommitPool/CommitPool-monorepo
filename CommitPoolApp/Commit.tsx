import React, { Component } from "react";
import { StyledView, StyledText, StyledTouchableOpacityRed } from "./components/styles";

export default class Commit extends Component <{next: any}, {step: Number}> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1
    };
  }

  go = () => {

  }

  render() {
    return (
        <StyledView style={{flex: 1, justifyContent: 'space-around'}}>
            <StyledText >
               {"Now you're set-up with Strava and funds, you can set your goals and stake."} 
            </StyledText>
            <StyledTouchableOpacityRed
                    onPress={() => this.props.next(6)}>
                <StyledText style={{fontSize: 30, color:'white'  }}>Let's Go!</StyledText>
            </StyledTouchableOpacityRed>
        </StyledView>
    );
  }
}