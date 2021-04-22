import React, { Component } from "react";
import {
  StyledBackdropDark,
  StyledView,
  StyledViewContainer,
  StyledViewRow,
  StyledText,
  StyledTextDark,
  StyledTextInput,
  StyledTextLarge,
  StyledTouchableOpacityWhite,
} from "./components/styles";

import { utils } from "ethers";
import { Dimensions } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

export default class MakeCommitment extends Component<
  { next: any; code: any; web3: any },
  {
    txSent: Boolean;
    loading: Boolean;
    distance: Number;
    stake: Number;
    daysToStart: Number;
    duration: Number;
    activity: {};
    activities: any;
  }
> {
  constructor(props) {
    super(props);

    this.state = {
      distance: 0,
      stake: 0,
      daysToStart: 0,
      duration: 0,
      loading: false,
      txSent: false,
      activity: {},
      activities: [],
    };
  }

  async componentDidMount() {
    const { web3 } = this.props;

    const commitPoolContract = web3.contracts.commitPool;

    console.log("SPC:", commitPoolContract);
    let activities = [];
    let exists = true;
    let index = 0;

    while (exists) {
      try {
        const key = await commitPoolContract.activityKeyList(index);
        const activity = await commitPoolContract.activities(key);
        const clone = Object.assign({}, activity);
        clone.key = key;
        activities.push(clone);
        index++;
      } catch (error) {
        exists = false;
      }
      console.log("GOT ACTIVITIES", activities);
    }

    const formattedActivities = activities.map((act) => {
      if (act[0] === "Run") {
        return {
          label: "Run 🏃‍♂️",
          value: act.key,
        };
      } else if (act[0] === "Ride") {
        return {
          label: "Ride 🚲",
          value: act.key,
        };
      } else {
        return {
          label: act[0],
          value: act.key,
        };
      }
    });

    this.setState({
      activities: formattedActivities,
      activity: formattedActivities[0],
    });
  }

  addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  calculateStart = (_daysToStart: number) => {
    if (_daysToStart === 0) {
      const result = new Date();
      return result;
    } else {
      const result = this.addDays(new Date(), _daysToStart);
      result.setHours(0, 0, 0, 0); //start at next day 00:00
      return result;
    }
  };

  calculateEnd = (_startTime: Date, _duration: number) => {
    const result = this.addDays(_startTime, _duration);
    result.setHours(24, 0, 0, 0); //give until end of day
    return result;
  };

  async createCommitment() {
    const { web3 } = this.props;
    const account = web3.provider.provider.selectedAddress;

    let commitPoolContract = web3.contracts.commitPool;
    commitPoolContract = commitPoolContract.connect(web3.provider.getSigner());

    let daiContract = web3.contracts.dai;
    daiContract = daiContract.connect(web3.provider.getSigner());

    const distanceInMiles = Math.floor(this.state.distance);
    const startTime = this.calculateStart(this.state.daysToStart);
    const startTimestamp = Math.ceil(startTime.valueOf() / 1000); //to seconds
    const endTimestamp = Math.ceil(
      this.calculateEnd(startTime, this.state.duration).valueOf() / 1000
    ); //to seconds
    const stakeAmount = utils.parseEther(this.state.stake.toString());
    this.setState({ loading: true });

    const allowance = await daiContract.allowance(
      account,
      commitPoolContract.address
    );
    if (allowance.gte(stakeAmount)) {
      const dcReceipt = await commitPoolContract.depositAndCommit(
        this.state.activity,
        distanceInMiles * 100,
        startTimestamp,
        endTimestamp,
        stakeAmount,
        stakeAmount,
        String(this.props.code.athlete.id),
        { gasLimit: 5000000 }
      );
      console.log("RECEIPT D&C:", dcReceipt);
    } else {
      const daiReceipt = await daiContract.approve(
        commitPoolContract.address,
        stakeAmount
      );
      const dcReceipt = await commitPoolContract.depositAndCommit(
        this.state.activity,
        distanceInMiles * 100,
        startTimestamp,
        endTimestamp,
        stakeAmount,
        stakeAmount,
        String(this.props.code.athlete.id),
        { gasLimit: 5000000 }
      );
      console.log("RECEIPT DAI:", daiReceipt);
      console.log("RECEIPT D&C:", dcReceipt);
    }

    this.setState({ loading: false, txSent: true });
  }

  getActivityName() {
    return this.state.activities.find(
      (act: any) => act.value === this.state.activity
    ).label;
  }

  render() {
    const { width } = Dimensions.get("window");

    return (
      <StyledViewContainer>
        {this.state.loading ? (
          <StyledBackdropDark>
            <StyledText>⌛</StyledText>
          </StyledBackdropDark>
        ) : undefined}

        {!this.state.txSent ? (
          <StyledView>
            <StyledTextLarge style={{ fontWeight: "bold" }}>
              Create Commitment {"\n\n"}
            </StyledTextLarge>
            <StyledText>
              {
                "Now that you've connected Strava and have funds in your wallet, you can set up your commitment! \n\n"
              }
            </StyledText>
            <StyledViewRow
              style={{
                zIndex: 5000,
              }}
            >
              <StyledText style={{ fontWeight: "bold" }}>Activity:</StyledText>
              <DropDownPicker
                items={this.state.activities}
                containerStyle={{ height: 40 }}
                style={{ backgroundColor: "#fafafa", width: 135 }}
                itemStyle={{
                  justifyContent: "flex-start",
                }}
                dropDownStyle={{ backgroundColor: "#fafafa" }}
                onChangeItem={(item) => {
                  console.log("change", item);
                  this.setState({ activity: item.value });
                }}
              />
            </StyledViewRow>
            <StyledViewRow>
              <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
                Distance:
              </StyledText>
              <StyledTextInput
                onChangeText={(text) =>
                  this.setState({ distance: Number(text) })
                }
              ></StyledTextInput>
              <StyledText style={{ textAlign: "left" }}> Miles</StyledText>
            </StyledViewRow>
            <StyledViewRow>
              <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
                Stake:
              </StyledText>
              <StyledTextInput
                onChangeText={(text) => this.setState({ stake: Number(text) })}
              ></StyledTextInput>
              <StyledText style={{ textAlign: "left" }}> DAI</StyledText>
            </StyledViewRow>
            <StyledViewRow>
              <StyledText
                style={{
                  fontWeight: "bold",
                }}
              >
                Starting in
              </StyledText>
              <StyledTextInput
                onChangeText={(text) =>
                  this.setState({ daysToStart: Number(text) })
                }
              ></StyledTextInput>
              <StyledText style={{ textAlign: "left" }}>day(s)</StyledText>
            </StyledViewRow>

            <StyledViewRow>
              <StyledText>for</StyledText>
              <StyledTextInput
                onChangeText={(text) =>
                  this.setState({ duration: Number(text) })
                }
              ></StyledTextInput>
              <StyledText style={{ textAlign: "left" }}> day(s)</StyledText>
            </StyledViewRow>
            <StyledTouchableOpacityWhite
              onPress={() => this.createCommitment()}
            >
              <StyledTextDark>Stake and Commit</StyledTextDark>
            </StyledTouchableOpacityWhite>
          </StyledView>
        ) : (
          <StyledView>
            {this.state.loading ? (
              <StyledBackdropDark>
                <StyledText>⌛</StyledText>
              </StyledBackdropDark>
            ) : undefined}
            <StyledTextLarge>Commitment Created</StyledTextLarge>
            <StyledTextLarge>✔️</StyledTextLarge>
            <StyledViewRow>
              <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
                Activity:
              </StyledText>
              <StyledText style={{ marginLeft: 10 }}>
                {this.getActivityName()}
              </StyledText>
            </StyledViewRow>
            <StyledViewRow>
              <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
                Distance:
              </StyledText>
              <StyledText style={{ marginLeft: 10 }}>
                {this.state.distance} Miles
              </StyledText>
            </StyledViewRow>
            <StyledViewRow>
              <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
                Stake:
              </StyledText>
              <StyledText style={{ marginLeft: 10 }}>
                {this.state.stake} DAI
              </StyledText>
            </StyledViewRow>
            <StyledViewRow>
              <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
                Starting in{" "}
              </StyledText>
              <StyledText style={{ marginLeft: 10 }}>
                {this.state.daysToStart} day(s)
              </StyledText>
            </StyledViewRow>
            <StyledViewRow>
              <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
                for
              </StyledText>
              <StyledText style={{ marginLeft: 10 }}>
                {this.state.duration} day(s)
              </StyledText>
            </StyledViewRow>

            <StyledTouchableOpacityWhite onPress={() => this.props.next(6)}>
              <StyledTextDark style={{ marginBottom: 0 }}>
                Track Progress
              </StyledTextDark>
            </StyledTouchableOpacityWhite>
          </StyledView>
        )}
      </StyledViewContainer>
    );
  }
}
