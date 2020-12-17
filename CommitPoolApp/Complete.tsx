import React, { Component } from "react";
import { View, StyleSheet, Image, Text, Button, TouchableOpacity } from "react-native";
import ConfettiCannon from 'react-native-confetti-cannon';

export default class Complete extends Component <{next: any, account: any}, {loading: Boolean, step: Number, fill: number}> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      fill: 60,
      loading: false
    };
  }

  go = () => {

  }

  render() {
    return (
        <View style={{backgroundColor: '#D45353', flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
            <ConfettiCannon count={100} origin={{x: 100, y: 0}} />
            <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 50, color: 'white'}}>Congrats!</Text>
                <Text style={{fontSize: 30, color: 'white', marginBottom: 25}}>Commitment Complete</Text>
                <Text style={{fontSize: 50, marginBottom: 25}}>✔️</Text>
            </View>
            <TouchableOpacity
                    style={{width: 300, height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}
                    onPress={() => this.go()}
                    disabled={this.state.fill !== 100}>
                <Text style={{fontSize: 30}}>Claim Reward</Text>
            </TouchableOpacity>
        </View>
    );
  }
}