import React, { Component } from "react";
import { TextInput } from "react-native";
import {
  StyledView,
  StyledViewRow,
  StyledText,
  StyledTouchableOpacityRed,
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

    let commitPoolContract = web3.contracts.commitPool;

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
      <StyledView style={{ flex: 1, width, justifyContent: "space-around" }}>
        {this.state.loading ? (
          <StyledView
            style={{
              justifyContent: "center",
              position: "absolute",
              right: 0,
              left: 0,
              top: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 2,
            }}
          >
            <StyledText>⌛</StyledText>
          </StyledView>
        ) : undefined}
        {!this.state.txSent ? (
          <StyledView style={{ flex: 1, justifyContent: "space-around" }}>
            <StyledView>
              <StyledText>
                {
                  "Now that you've connected Strava and have funds in your wallet, you can set up your commitment!"
                }
              </StyledText>
              <StyledText>Create Commitment</StyledText>
              <StyledView
                style={{
                  flexDirection: "row",
                  width: 300,
                  padding: 10,
                  zIndex: 5000,
                }}
              >
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  Activity:
                </StyledText>
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
              </StyledView>
              <StyledViewRow>
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  Distance:
                </StyledText>
                <StyledView
                  style={{ flex: 1, flexDirection: "row", marginLeft: 10 }}
                >
                  <TextInput
                    style={{
                      textAlign: "center",
                      borderRadius: 5,
                      backgroundColor: "white",
                      fontSize: 28,
                      color: "black",
                      width: 30 + "%",
                    }}
                    onChangeText={(text) =>
                      this.setState({ distance: Number(text) })
                    }
                  ></TextInput>
                  <StyledText> Miles</StyledText>
                </StyledView>
              </StyledViewRow>
              <StyledViewRow>
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  Stake:
                </StyledText>
                <StyledView
                  style={{ flex: 1, flexDirection: "row", marginLeft: 10 }}
                >
                  <TextInput
                    style={{
                      textAlign: "center",
                      borderRadius: 5,
                      backgroundColor: "white",
                      fontSize: 28,
                      color: "black",
                      width: 30 + "%",
                    }}
                    onChangeText={(text) =>
                      this.setState({ stake: Number(text) })
                    }
                  ></TextInput>
                  <StyledText> Dai</StyledText>
                </StyledView>
              </StyledViewRow>
              <StyledViewRow>
                <StyledText
                  style={{
                    flex: 1,
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                  }}
                >
                  Starting in
                </StyledText>
                <StyledView
                  style={{ flex: 1, flexDirection: "row", marginLeft: 10 }}
                >
                  <TextInput
                    style={{
                      textAlign: "center",
                      borderRadius: 5,
                      backgroundColor: "white",
                      fontSize: 28,
                      color: "black",
                      width: 30 + "%",
                    }}
                    onChangeText={(text) =>
                      this.setState({ daysToStart: Number(text) })
                    }
                  ></TextInput>
                  <StyledText> day(s)</StyledText>
                </StyledView>
              </StyledViewRow>
              <StyledViewRow>
                <StyledText
                  style={{
                    flex: 1,
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                  }}
                >
                  for
                </StyledText>
                <StyledView
                  style={{ flex: 1, flexDirection: "row", marginLeft: 10 }}
                >
                  <TextInput
                    style={{
                      textAlign: "center",
                      borderRadius: 5,
                      backgroundColor: "white",
                      fontSize: 28,
                      color: "black",
                      width: 30 + "%",
                    }}
                    onChangeText={(text) =>
                      this.setState({ duration: Number(text) })
                    }
                  ></TextInput>
                  <StyledText style={{ flex: 1 }}> day(s)</StyledText>
                </StyledView>
              </StyledViewRow>
            </StyledView>

            <StyledTouchableOpacityRed onPress={() => this.createCommitment()}>
              <StyledText>Stake and Commit</StyledText>
            </StyledTouchableOpacityRed>
          </StyledView>
        ) : (
          <StyledView
            style={{
              backgroundColor: "#D45353",
              flex: 1,
              justifyContent: "space-around",
            }}
          >
            {this.state.loading ? (
              <StyledView
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  position: "absolute",
                  right: 0,
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  zIndex: 2,
                }}
              >
                <StyledText>⌛</StyledText>
              </StyledView>
            ) : undefined}
            <StyledView>
              <StyledText style={{ fontSize: 50 }}>
                Commitment Created
              </StyledText>
              <StyledText style={{ fontSize: 50 }}>✔️</StyledText>
              <StyledViewRow>
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  Activity:
                </StyledText>
                <StyledText style={{ flex: 1, marginLeft: 10 }}>
                  {this.getActivityName()}
                </StyledText>
              </StyledViewRow>
              <StyledViewRow>
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  Distance:
                </StyledText>
                <StyledText style={{ flex: 1, marginLeft: 10 }}>
                  {this.state.distance} Miles
                </StyledText>
              </StyledViewRow>
              <StyledViewRow>
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  Stake:
                </StyledText>
                <StyledText style={{ flex: 1, marginLeft: 10 }}>
                  {this.state.stake} Dai
                </StyledText>
              </StyledViewRow>
              <StyledViewRow>
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  Starting in{" "}
                </StyledText>
                <StyledText style={{ flex: 1, marginLeft: 10 }}>
                  {this.state.daysToStart} day(s)
                </StyledText>
              </StyledViewRow>
              <StyledViewRow>
                <StyledText style={{ flex: 1, fontWeight: "bold" }}>
                  for
                </StyledText>
                <StyledText style={{ flex: 1, marginLeft: 10 }}>
                  {this.state.duration} day(s)
                </StyledText>
              </StyledViewRow>
            </StyledView>

            <StyledTouchableOpacityRed onPress={() => this.props.next(6)}>
              <StyledText>Track Progress</StyledText>
            </StyledTouchableOpacityRed>
          </StyledView>
        )}
      </StyledView>
    );
  }
}
