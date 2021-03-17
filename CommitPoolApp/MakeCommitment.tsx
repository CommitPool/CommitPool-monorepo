import React, { Component } from "react";
import {
  StyledBackdropDark,
  StyledView,
  StyledViewContainer,
  StyledViewRow,
  StyledText,
  StyledTextInput,
  StyledTextLarge,
  StyledTouchableOpacityRed,
} from "./components/styles";

import { utils } from "ethers";
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

  createPermitMessageData = () => {
    const { account, contracts } = this.props.web3
    const fromAddress = account;
    const expiry = Date.now() + 120;
    const nonce = 1;
    const spender = contracts.commitPool.address;

    const message = {
      holder: fromAddress,
      spender: spender,
      nonce: nonce,
      expiry: expiry,
      allowed: true,
    };
  
    const typedData = JSON.stringify({
      types: {
        EIP712Domain: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "version",
            type: "string",
          },
          {
            name: "chainId",
            type: "uint256",
          },
          {
            name: "verifyingContract",
            type: "address",
          },
        ],
        Permit: [
          {
            name: "holder",
            type: "address",
          },
          {
            name: "spender",
            type: "address",
          },
          {
            name: "nonce",
            type: "uint256",
          },
          {
            name: "expiry",
            type: "uint256",
          },
          {
            name: "allowed",
            type: "bool",
          },
        ],
      },
      primaryType: "Permit",
      domain: {
        name: "Dai Stablecoin",
        version: "1",
        chainId: 4,
        verifyingContract: contracts.dai.address,
      },
      message: message,
    });
  
    return {
      typedData,
      message,
    };
  };

  signData = async (web3, typedData) => {
    const { account, biconomy, torus } = web3;
    const provider = torus.provider;
    console.log("PROVIDER TO SIGN DATA: ", provider)
    return new Promise(function (resolve, reject) {
      provider.sendAsync(
        {
          id: 1,
          method: "eth_signTypedData_v3",
          params: [account, typedData],
          from: account,
        },
        function (err, result) {
          if (err) {
            console.log(err);
            reject(err); //TODO
          } else {
            const r = result.result.slice(0, 66);
            const s = "0x" + result.result.slice(66, 130);
            const v = Number("0x" + result.result.slice(130, 132));
            resolve({
              v,
              r,
              s,
            });
          }
        }
      );
    });
  };

  signTransferPermit = async () => {
    const messageData = this.createPermitMessageData();
    const sig = await this.signData(this.props.web3, messageData.typedData);
    return Object.assign({}, sig, messageData.message);
  };

  async createCommitment() {
    const { web3 } = this.props;
    const { account, biconomy } = web3;
    const provider = biconomy.getEthersProvider();
    const gasLimit = 500000;

    let commitPoolContract = web3.contracts.commitPool;
    let daiContract = web3.contracts.dai;

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

    try {
      let txParams;

      if (allowance.gte(stakeAmount)) {
        const {
          data,
        } = await commitPoolContract.populateTransaction.depositAndCommit(
          this.state.activity,
          distanceInMiles * 100,
          startTimestamp,
          endTimestamp,
          stakeAmount,
          stakeAmount,
          String(this.props.code.athlete.id)
        );
  
        console.log("Data: ", data)
        
        txParams = {
          data: data,
          to: commitPoolContract.address,
          from: account,
          gasLimit: gasLimit,
          signatureType: "EIP712_SIGN",
        };

      } else {
        const signedTransferPermit = await this.signTransferPermit();
        console.log("SIGNED PERMIT: ", signedTransferPermit);

        const { expiry, nonce, v , r, s } = signedTransferPermit;
        console.log("V, R, S: ", v, " ", r, " ", s)

        const {
          data,
        } = await commitPoolContract.populateTransaction.depositAndCommitPermit(
          this.state.activity,
          distanceInMiles * 100,
          startTimestamp,
          endTimestamp,
          stakeAmount,
          stakeAmount,
          nonce,
          Math.floor(expiry / 1000),
          v,
          r,
          s,
          String(this.props.code.athlete.id),
          )

        console.log("Data: ", data)
        
        txParams = {
          data: data,
          to: commitPoolContract.address,
          from: account,
          gasLimit: gasLimit,
          signatureType: "EIP712_SIGN",
        };

      }

      const dcReceipt = await provider.send("eth_sendTransaction", [
        txParams,
      ]);
      
      console.log("Sending transaction")
      provider.once(dcReceipt, (transaction) => {
        console.log("TX: ", transaction);
      });

      this.setState({ loading: false, txSent: true });

    } catch (error) {
      console.log("ERROR: ", error);
      this.setState({ loading: false, txSent: false });
    }

  }

  getActivityName() {
    return this.state.activities.find(
      (act: any) => act.value === this.state.activity
    ).label;
  }

  render() {
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
            <StyledTouchableOpacityRed onPress={() => this.createCommitment()}>
              <StyledText>Stake and Commit</StyledText>
            </StyledTouchableOpacityRed>
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

            <StyledTouchableOpacityRed onPress={() => this.props.next(6)}>
              <StyledText style={{ marginBottom: 0 }}>
                Track Progress
              </StyledText>
            </StyledTouchableOpacityRed>
          </StyledView>
        )}
      </StyledViewContainer>
    );
  }
}
