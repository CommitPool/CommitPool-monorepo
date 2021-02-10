import React, { Component } from "react";
import { View, Text, TouchableOpacity, Clipboard } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { utils } from "ethers";
export default class Wallet extends Component<
  { next: any; account: any; web3Helper: any },
  { user: any; balance: string; daiBalance: string; commitment: any }
> {
  constructor(props) {
    super(props);

    this.state = {
      user: undefined,
      balance: "0.0",
      daiBalance: "0.0",
      commitment: undefined,
    };
  }

  async componentDidMount() {
    const web3 = this.props.web3Helper;
    web3
      .initialize()
      .then(() => {
        this.setStateInfo();
      })
      .then(() => {
        setInterval(async () => {
          if (this.state.user) {
            const web3 = this.props.web3Helper;
            const daiBalance = await web3.contracts.dai.balanceOf(
              this.state.user
            );
            const balance = await web3.web3Provider.getBalance(this.state.user);
            this.setState({ balance: utils.formatEther(balance) });
            this.setState({ daiBalance: utils.formatEther(daiBalance) });
          }
        }, 2500);
      });
  }

  //TODO Control over provider and get accounts
  setStateInfo = async () => {
    const web3 = this.props.web3Helper;
    const _user = web3.web3Provider.provider.selectedAddress;
    this.setState({ user: _user });
    const balance = await web3.web3Provider.getBalance(_user);
    const daiBalance = await web3.contracts.dai.balanceOf(_user);

    this.setState({ balance: utils.formatEther(balance) });
    this.setState({ daiBalance: utils.formatEther(daiBalance) });
  };

  async next() {
    const commitPoolContract = this.props.web3Helper.contracts.spc;

    try {
      const commitment = await commitPoolContract.commitments(this.state.user);
      console.log(commitment);
      if (commitment.exists) {
        this.props.next(6);
      } else {
        this.props.next(5);
      }
    } catch (error) {
      this.props.next(5);
    }
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 50, color: "white", marginBottom: 70 }}>
            Add Funds
          </Text>
          <Text
            style={{
              fontSize: 20,
              textAlign: "center",
              color: "white",
              marginBottom: 10,
            }}
          >
            This is your local wallet. We've created one for you here in your
            browser.
            {"\n"}
            All you need to do is add funds by transferring them to this
            wallet's adddress below.
          </Text>
          <Text style={{ fontSize: 15, color: "white", marginBottom: 70 }}>
            You can get funds on testnet from https://faucet.matic.network
          </Text>
          <QRCode value="this.state.user" size={225} />
          <Text
            onPress={() => Clipboard.setString(this.state.user)}
            style={{ fontSize: 14, color: "white", marginTop: 10 }}
          >
            {this.state.user}
          </Text>
          <Text
            style={{
              fontSize: 30,
              color: "white",
              marginTop: 25,
              fontWeight: "bold",
            }}
          >
            Balances:
          </Text>
          <Text style={{ fontSize: 30, color: "white", marginTop: 25 }}>
            {this.state.balance} MATIC
          </Text>
          <Text style={{ fontSize: 30, color: "white", marginTop: 25 }}>
            {this.state.daiBalance} MATIC Dai
          </Text>
        </View>
        <TouchableOpacity
          style={{
            width: 300,
            height: 50,
            backgroundColor: "#D45353",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => this.next()}
        >
          <Text style={{ fontSize: 30, color: "white" }}>Get Started!</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
