import React, { Component } from "react";
import { StyleSheet, View} from "react-native";
import Login from "./Login";
import Track from "./Track";
import MakeCommitment from "./MakeCommitment";
import Complete from "./Complete";
import Wallet from "./Wallet";
import Welcome from "./Welcome";
import Directions from "./Directions";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions } from "react-native";


export default class Main extends Component <
  { web3: any; stravaOAuth: any; code: string },
  { step: Number }
> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      height: 300,
      width: 300,
    };
  }

  updateDimensions() {
      const { width, height } = Dimensions.get("window")
      this.setState({ width: width, height: height });

    }

    componentDidMount() {
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions.bind(this));
    }

/**
 * Remove event listener
 */
  componentWillUnmount() {
      window.removeEventListener("resize", this.updateDimensions.bind(this));
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

        case 3:
          return (
            <Directions next={this.onClick} stravaOAuth={this.props.stravaOAuth} />
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
      <View style={[styles.bg, {height: this.state.height}, {width: this.state.width}]}>
        {this.renderSwitch()}
      </View>
    );
  }
}


// const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  bg: {
    //flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#d45454",
    //width = {state.width},
    //height = {state.height},
    //alignSelf: 'stretch',
    borderRadius: 5,
    flexWrap: 'wrap',
  },
});
