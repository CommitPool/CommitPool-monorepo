import React, { Component } from "react";
import { View, Image, Text, TouchableOpacity, StyleSheet } from "react-native";
import Login from "./Login";
// import Commit from "./Commit";
import Track from "./Track";
import MakeCommitment from "./MakeCommitment";
import Complete from "./Complete";
import Wallet from "./Wallet";
import Welcome from "./Welcome";
import web3Helper from "./components/web3-helper/web3-helper.js";


import { Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default class Main extends Component<
  { stravaOAuth: any; code: string },
  { step: Number; account: any, web3Helper: any }
> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      account: undefined,
      web3Helper: undefined,
    };
  }

  componentDidMount() {
    this.setState({web3Helper: web3Helper});
  }

  componentWillReceiveProps(newProps) {
    if (newProps.code !== this.props.code) {
      this.setState({ step: 4 });
    }
  }

  onClick = (step: Number) => {
    this.setState({ step: step });
  };

  renderSwitch = () => {
    switch (this.state.step) {
      case 1:
        return (
          <Welcome
            next={this.onClick}
            code={this.props.code}
          ></Welcome>
        );
      case 2:
        return (
          <Login
            next={this.onClick}
            stravaOAuth={this.props.stravaOAuth}
            code={this.props.code}
          ></Login>
        );
      case 4:
        return (
          <LinearGradient
            colors={["#D45353", "#D45353", "white"]}
            style={styles.linearGradient}
          >
            <Wallet next={this.onClick} account={this.state.account} web3Helper={this.state.web3Helper}></Wallet>
          </LinearGradient>
        );
      // case 5:
      //   return (
      //     <LinearGradient
      //       colors={["#D45353", "#D45353", "white"]}
      //       style={styles.linearGradient}
      //     >
      //       <Commit next={this.onClick}></Commit>
      //     </LinearGradient>
      //   );
      case 5:
        return (
          <LinearGradient
            colors={["#D45353", "#D45353", "white"]}
            style={styles.linearGradient}
          >
            <MakeCommitment
              next={this.onClick}
              account={this.state.account}
              code={this.props.code}
              web3Helper={this.state.web3Helper}
            ></MakeCommitment>
          </LinearGradient>
        );
      case 6:
        return (
          <Track
            next={this.onClick}
            account={this.props.account}
            code={this.props.code}
          ></Track>
        );
      case 7:
        return (
          <Complete success={true} next={this.onClick} account={this.state.account}></Complete>
        );
      case 8:
        return (
          <Complete success={false} next={this.onClick} account={this.state.account}></Complete>
        );
    }
  };

  render() {
    return <View style={{ flex: 1 }}>{this.renderSwitch()}</View>;
  }
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width,
    height,
    borderRadius: 5,
  },
});
