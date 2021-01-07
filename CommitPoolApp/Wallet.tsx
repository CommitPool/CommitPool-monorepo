import React, { Component } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Clipboard,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import daiAbi from "./daiAbi.json";
import abi from "../commitpool-contract-singleplayer/out/abi/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json";
import Contract from "./components/contract/contract-component";
export default class Wallet extends Component<
  { next: any; provider: any },
  { account: any; balance: number; daiBalance: number; commitment: any }
> {
  contract: any;
  contractAddress: string;
  daiContract: any;
  daiContractAddress: string;
  constructor(props) {
    super(props);
    this.contractAddress = "0x104caee222E39eAd76F646daf601FD2302CBf164";
    this.daiContractAddress = "0x70d1f773a9f81c852087b77f6ae6d3032b02d2ab";
    this.state = {
      account: undefined,
      balance: 0.0,
      daiBalance: 0.0,
      commitment: undefined,
    };
  }

  async componentDidMount() {
    await this.props.provider
      .listAccounts()
      .then((accounts) => {
        const account = accounts[0];
        this.setState({ account: account });
        return account;
      })
      .then(
        async (account) =>
          await this.props.provider.getBalance(account).then((balance) => {
            this.setState({
              balance: balance.div(1000000000000000).toNumber() / 1000,
            });
          })
      );

    await Contract(this.contractAddress, abi, this.state.account).then(
      (contract) => (this.contract = contract)
    );

    await Contract(this.daiContractAddress, daiAbi, this.state.account)
      .then((contract) => {
        this.daiContract = contract;
        return this.daiContract;
      })
      .then((daiContract) => daiContract.balanceOf(this.state.account))
      .then((balance) =>
        this.setState({
          daiBalance: balance.div(1000000000000000).toNumber() / 1000,
        })
      );

    setInterval(async () => {
      await this.props.provider
        .getBalance(this.state.account)
        .then((balance) =>
          this.setState({
            balance: balance.div(1000000000000000).toNumber() / 1000,
          })
        );

      await this.daiContract
        .balanceOf(this.state.account)
        .then((balance) =>
          this.setState({
            daiBalance: balance.div(1000000000000000).toNumber() / 1000,
          })
        );
    }, 2500);
  }

  async next() {
    const commitPoolContract = this.contract;
    try {
      const commitment = await commitPoolContract.commitments(
        this.state.account
      );
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
    const account = this.state.account === undefined ? "" : this.state.account;

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
            This is the balance of you connected wallet with a conventient QR code and address for deposits.
            {"\n"}
            All you need to do is add funds by transferring them to this
            wallet's adddress below.
          </Text>
          <Text style={{ fontSize: 15, color: "white", marginBottom: 70 }}>
            You can get funds on testnet from https://faucet.matic.network
          </Text>
          <QRCode value="this.state.account" size={225} />
          <Text
            onPress={() => Clipboard.setString(this.state.account)}
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
      </View>
    );
  }
}
