import React, { Component } from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { BigNumber, ethers } from "ethers";
import { AsyncStorage } from "react-native";
import getEnvVars from "./environment.js";
import { DateTime } from "luxon";
import {
  StyledBackdropDark,
  StyledTouchableOpacityWhite,
  StyledText,
  StyledTextLarge,
  StyledView,
  StyledViewContainer,
} from "./components/styles";

export default class Track extends Component<
  { next: any; code: string; web3: any },
  {
    refreshToken: string;
    type: string;
    account: any;
    total: number;
    startTime: Number;
    endTime: Number;
    loading: Boolean;
    step: Number;
    fill: number;
    goal: number;
    stake: number;
    accessToken: string;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      account: {},
      refreshToken: "",
      step: 1,
      fill: 0,
      loading: false,
      goal: 0,
      total: 0,
      startTime: 0,
      endTime: 0,
      type: "",
      stake: 0,
      accessToken: "",
    };
  }

  async componentDidMount() {
    const refreshToken: any = await this._retrieveData("rt");
    this.setState({ refreshToken: refreshToken });
    this.setAccount();

    await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: 66714,
        client_secret: "6b5e8c4fd9bb841d1e8d9be15020dab2017607e4",
        refresh_token: this.state.refreshToken,
        grant_type: "refresh_token",
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        console.log("TOKEN", json)
        this.setState({ accessToken: json.access_token });
      });

    this.getCommitment();
  }

  _retrieveData = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // We have data!!
        return value;
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  setAccount() {
    const { web3 } = this.props;
    this.setState({ account: web3.provider.provider.selectedAddress });
  }

  async getCommitment() {
    const { web3 } = this.props;
    const account = web3.provider.provider.selectedAddress;
    let commitPoolContract = web3.contracts.commitPool;

    const commitment = await commitPoolContract.commitments(account);

    
    if (commitment.reportedValue.gte(commitment.goalValue)) {
      this.setState({ loading: false });
      this.props.next(7);
      return;
    }

    const type = await commitPoolContract.activities(commitment["activityKey"]);
    this.setState({
      goal: commitment["goalValue"].toNumber() / 100,
      startTime: commitment["startTime"].toNumber(),
      endTime: commitment["endTime"].toNumber(),
      type: type[0],
      stake: Number(ethers.utils.formatEther(commitment["stake"]))
    });

    this.getActivity();

    this.setState({ fill: this.state.total / this.state.goal });
  }

  async getActivity() {
    await fetch(
      "https://test2.dcl.properties/activities?startTime=" +
        this.state.startTime +
        "&endTime=" +
        this.state.endTime +
        "&type=" +
        this.state.type +
        "&accessToken=" +
        this.state.accessToken,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer: " + this.state.accessToken,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        this.setState({ total: json.total });
        this.setState({ fill: this.state.total / this.state.goal });
      });
  }

  async getUpdatedActivity() {
    const { web3 } = this.props;
    const account = web3.provider.provider.selectedAddress;
    const commitPoolContract = web3.contracts.commitPool;
    const { oracleAddress, jobId } = getEnvVars();

    let contractWithSigner = commitPoolContract.connect(
      web3.provider.getSigner()
    );
    this.setState({ loading: true });
    try {
      console.log("ORACLE", oracleAddress, "JOBID", jobId)
      await contractWithSigner.requestActivityDistance(
        account,
        oracleAddress,
        jobId,
        { gasLimit: 500000 }
      );

      contractWithSigner.on(
        "RequestActivityDistanceFulfilled",
        async (id: string, distance: BigNumber, committer: string) => {
          const now = new Date().getTime();

          if (
            committer.toLowerCase() ===
            web3.provider.provider.selectedAddress.toLowerCase()
          ) {
            const commitment = await contractWithSigner.commitments(account);
            if (commitment.reportedValue.gte(commitment.goalValue)) {
              this.setState({ loading: false });
              this.props.next(7);
            } else if (now < commitment.endTime * 1000) {
              this.setState({ loading: false });
              alert("Goal not yet achieved. Keep going!");
            } else {
              this.setState({ loading: false });
              this.props.next(8);
            }
          }
        }
      );
    } catch (error) {
      console.log(error);
      this.setState({ loading: false });
    }
  }

  parseSecondTimestampToFullString(timestamp: number){
    return DateTime.fromSeconds(timestamp).toLocaleString({
        weekday: "long",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
}

  render() {
    return (
      <StyledViewContainer>
        {this.state.loading ? (
          <StyledBackdropDark>
            <StyledText>⌛</StyledText>
          </StyledBackdropDark>
        ) : undefined}
        <StyledView>
          <StyledTextLarge style={{ marginBottom: 70 }}>Track</StyledTextLarge>
          <AnimatedCircularProgress
            size={180}
            width={15}
            rotation={0}
            fill={this.state.fill}
            tintColor="white"
            onAnimationComplete={() => console.log("onAnimationComplete")}
            backgroundColor="#D45353"
          >
            {(fill) => <StyledText>{this.state.fill.toFixed(1)}%</StyledText>}
          </AnimatedCircularProgress>
          <StyledText>
            {((this.state.fill / 100) * this.state.goal).toFixed(1)}/
            {this.state.goal} Miles
            </StyledText>
          <StyledText
              >
                {`\n from ${this.parseSecondTimestampToFullString(
                  this.state.startTime
                )} \n to ${this.parseSecondTimestampToFullString(this.state.endTime)} \n\n`}
          </StyledText>
          <StyledText
              >
                {`Staking ${this.state.stake} DAI \n`}
          </StyledText>

        </StyledView>
        <StyledTouchableOpacityWhite
          style={
            this.state.fill < 100
              ? {
                  backgroundColor: "#999",
                  borderColor: "#999",
                }
              : {}
          }
          onPress={() => this.getUpdatedActivity()}
        >
          <StyledText style={
            this.state.fill < 100
              ? {
                  color: "white",
                }
              : { color: "#d45353"}
          }>Complete Goal</StyledText>
        </StyledTouchableOpacityWhite>
      </StyledViewContainer>
    );
  }
}
