import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { ethers } from "ethers";
import { AsyncStorage } from "react-native";
import abi from "../commitpool-contract-singleplayer/out/abi/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json";

export default class Track extends Component<
  { next: any; provider: any; code: string },
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
    accessToken: String;
  }
> {
  contract: any;
  contractAddress: string;
  constructor(props) {
    super(props);
    this.contractAddress = "0x104caee222E39eAd76F646daf601FD2302CBf164";
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
      accessToken: "",
    };
  }

  async componentDidMount() {
    await this.props.provider.listAccounts().then((accounts) => {
      this.setState({ account: accounts[0] });
    });

    const signer = await this.props.provider.getSigner();
    this.contract = await new ethers.Contract(
      this.contractAddress,
      abi,
      signer
    );

    const refreshToken: any = await this._retrieveData("rt");
    console.log(refreshToken);
    this.setState({ refreshToken: refreshToken });

    fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: 51548,
        client_secret: "28d56211b9ca33972055bf61010074fbedc3c7c2",
        refresh_token: this.state.refreshToken,
        grant_type: "refresh_token",
      }),
    })
      .then((res) => res.json())
      .then((json) => {
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

  async getCommitment() {
    const commitment = await this.contract.commitments(this.state.account);
    console.log(commitment);

    const type = await this.contract.activities(commitment["activityKey"]);
    console.log(type)
    this.setState({
      goal: commitment["goalValue"].toNumber() / 100,
      startTime: commitment["startTime"].toNumber(),
      endTime: commitment["endTime"].toNumber(),
      type: type.name,
    });

    this.getActivity();

    this.setState({ fill: this.state.total / this.state.goal });
  }

  async getActivity() {
    fetch(
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
    let contractWithSigner = this.contract;

    this.setState({ loading: true });
    try {
      console.log(this.state.account);
      await contractWithSigner.requestActivityDistance(
        this.state.account,
        "0x10d914A0586E527247C9530A899D74dC189Dbd80",
        "e21d39b70cad42d6bc6b42c64b853007",
        { gasLimit: 500000 }
      );

      let topic = ethers.utils.id(
        "RequestActivityDistanceFulfilled(bytes32,uint256,address)"
      );

      let filter = {
        address: this.contractAddress,
        topics: [topic],
      };

      contractWithSigner.provider.on(filter, async (result, event) => {
        const address = "0x" + result.topics[3].substr(26, 66).toLowerCase();
        console.log(
          address,
          this.state.account.toLowerCase()
        );
        if (address === this.state.account.toLowerCase()) {
          const commitment = await this.contract.commitments(
            this.state.account
          );
          if (commitment.reportedValue.gte(commitment.goalValue)) {
            this.setState({ loading: false });
            this.props.next(7);
          } else {
            this.setState({ loading: false });
            alert("Goal not yet achieved. Keep going!");
          }
        }
      });
    } catch (error) {
      console.log(error);
      this.setState({ loading: false });
    }
  }

  render() {
    return (
      <View
        style={{
          backgroundColor: "#D45353",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {this.state.loading ? (
          <View
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
            <Text style={{ fontSize: 25 }}>⌛</Text>
          </View>
        ) : undefined}
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 50, color: "white", marginBottom: 70 }}>
            Track
          </Text>
          <AnimatedCircularProgress
            size={180}
            width={15}
            rotation={0}
            fill={this.state.fill}
            tintColor="white"
            onAnimationComplete={() => console.log("onAnimationComplete")}
            backgroundColor="#D45353"
          >
            {(fill) => (
              <Text style={{ color: "white", fontSize: 30 }}>
                {this.state.fill.toFixed(1)}%
              </Text>
            )}
          </AnimatedCircularProgress>
          <Text style={{ fontSize: 22, color: "white", marginTop: 25 }}>
            {((this.state.fill / 100) * this.state.goal).toFixed(1)}/
            {this.state.goal} Miles
          </Text>
        </View>
        <TouchableOpacity
          style={
            this.state.fill !== 100
              ? {
                  width: 300,
                  height: 50,
                  backgroundColor: "#999",
                  alignItems: "center",
                  justifyContent: "center",
                }
              : {
                  width: 300,
                  height: 50,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                }
          }
          onPress={() => this.getUpdatedActivity()}
        >
          <Text style={{ fontSize: 30 }}>Claim Reward</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
