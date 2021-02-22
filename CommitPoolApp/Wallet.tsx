import React, { Component } from "react";
import { View, Text, TouchableOpacity, Clipboard } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { utils } from "ethers";

//TODO refresh on login
export default class Wallet extends Component<
  { next: any; web3: any },
  { balance: string; daiBalance: string; refresh: any }
> {
  constructor(props) {
    super(props);
    this.state = {
      balance: "0.0",
      daiBalance: "0.0",
      refresh: undefined,
    };
  }

  async componentDidMount() {
    const web3 = await this.props.web3.initialize();
    this.setStateInfo(web3);
    this.setStateRefresh(web3);
  }

  componentWillUnmount() {
    clearInterval(this.state.refresh);
  }

  async setStateInfo(web3: any) {
    console.log("WEB STATE", web3);
    const account = web3.provider.provider.selectedAddress;

    await web3.provider
      .getBalance(account)
      .then((balance) =>
        this.setState({ balance: utils.formatEther(balance) })
      );

    await web3.contracts.dai
      .balanceOf(account)
      .then((daiBalance) =>
        this.setState({ daiBalance: utils.formatEther(daiBalance) })
      );
  }

  async setStateRefresh(web3: any) {
    const refresh = setInterval(async () => {
      if (web3.provider !== undefined) {
        const account = web3.provider.provider.selectedAddress;

        await web3.provider
          .getBalance(account)
          .then((balance) =>
            this.setState({ balance: utils.formatEther(balance) })
          );

        await web3.contracts.dai
          .balanceOf(account)
          .then((daiBalance) =>
            this.setState({ daiBalance: utils.formatEther(daiBalance) })
          );
      }
    }, 2500);
    this.setState({ refresh: refresh });
  }

  logout = () => {
    this.props.web3.logOut();
    this.setState({ balance: "0", daiBalance: "0" });
    clearInterval(this.state.refresh);
  };

  async next() {
    const { web3 } = this.props;
    const account = web3.provider.provider.selectedAddress;
    const commitPoolContract = web3.contracts.commitPool;

    try {
      const commitment = await commitPoolContract.commitments(account);
      if (commitment.exists) {
        console.log("COMMITMENT EXISTS");
        this.props.next(6);
      } else {
        console.log("COMMITMENT DOES NOT EXIST");
        this.props.next(5);
      }
    } catch (error) {
      console.log("ERROR RETRIEVING COMMITMENT:", error);
      this.props.next(5);
    }
  }

  render() {
    const { web3 } = this.props;
    const account =
    web3.torus.isLoggedIn ? web3.provider.provider.selectedAddress : "";
    console.log("ACCOUNT", account);
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
            Login to your wallet via Torus by clicking the blue button below.
          </Text>
          <Text style={{ fontSize: 15, color: "white", marginBottom: 70 }}>
            You can get funds on testnet from https://faucet.matic.network
          </Text>
          <QRCode value="account" size={225} />
          <Text
            onPress={() => Clipboard.setString(account)}
            style={{ fontSize: 14, color: "white", marginTop: 10 }}
          >
            {account}
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
        <TouchableOpacity
          style={{
            width: 300,
            height: 50,
            backgroundColor: "#D45353",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() =>
            this.props.web3.torus.isLoggedIn
              ? this.logout()
              : this.props.web3.initialize()
          }
        >
          <Text style={{ fontSize: 30, color: "white" }}>
            {" "}
            {this.props.web3.torus.isLoggedIn ? "LOG OUT" : " LOG IN"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}
