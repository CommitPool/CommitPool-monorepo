import React, { Component } from "react";
import ConfettiCannon from "react-native-confetti-cannon";
import {
  StyledView,
  StyledViewContainer,
  StyledText, StyledTextDark,
  StyledTextLarge,
  StyledTouchableOpacityWhite,
} from "./components/styles";

export default class Complete extends Component<
  { success: boolean; next: any; web3: any },
  { loading: Boolean; step: Number; fill: number }
> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      fill: 60,
      loading: false,
    };
  }

  async go() {
    const { web3 } = this.props;

    let commitPoolContract = web3.contracts.commitPool;
    commitPoolContract = commitPoolContract.connect(web3.provider.getSigner());

    await commitPoolContract.processCommitmentUser();
    this.props.next(4);
  }

  render() {
    return (
      <StyledViewContainer>
        {this.props.success ? (
          <ConfettiCannon count={100} origin={{ x: 100, y: 0 }} />
        ) : undefined}
        {this.props.success ? (
          <StyledView>
            <StyledTextLarge>Congrats!</StyledTextLarge>
            <StyledText>Commitment Complete</StyledText>
            <StyledTextLarge>✔️</StyledTextLarge>
          </StyledView>
        ) : (
          <StyledView>
            <StyledTextLarge>Doh!</StyledTextLarge>
            <StyledText>Commitment Missed</StyledText>
            <StyledTextLarge>❌</StyledTextLarge>
          </StyledView>
        )}
        <StyledTouchableOpacityWhite onPress={() => this.go()}>
          <StyledTextDark>
            {this.props.success ? "Claim Reward" : "Re-Commit"}
          </StyledTextDark>
        </StyledTouchableOpacityWhite>
       </StyledViewContainer>
    );
  }
}
