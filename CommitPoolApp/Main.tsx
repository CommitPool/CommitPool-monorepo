import React, { Component } from "react";
import { StyleSheet } from "react-native";
import Login from "./Login";
import Track from "./Track";
import MakeCommitment from "./MakeCommitment";
import Complete from "./Complete";
import Wallet from "./Wallet";
import Welcome from "./Welcome";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";
export default class Main extends Component<
  { web3: any; stravaOAuth: any; code: string },
  { step: Number }
> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
    };
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
        return <Welcome next={this.onClick} />;
      case 2:
        return (
          <Login next={this.onClick} stravaOAuth={this.props.stravaOAuth} />
        );
      case 4:
        return <Wallet next={this.onClick} web3={this.props.web3}></Wallet>;
      case 5:
        return (
          <MakeCommitment
            next={this.onClick}
            code={this.props.code}
            web3={this.props.web3}
          ></MakeCommitment>
        );
      case 6:
        return (
          <Track
            next={this.onClick}
            code={this.props.code}
            web3={this.props.web3}
          />
        );
      case 7:
        return (
          <Complete success={true} next={this.onClick} web3={this.props.web3} />
        );
      case 8:
        return (
          <Complete
            success={false}
            next={this.onClick}
            web3={this.props.web3}
          />
        );
    }
  };

  render() {
    return (
      <LinearGradient
        colors={["#D45353", "#D45353", "white"]}
        style={styles.linearGradient}
      >
        {this.renderSwitch()}
      </LinearGradient>
    );
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
