import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ConfettiCannon from 'react-native-confetti-cannon';

export default class Complete extends Component <{success: boolean, next: any, web3: any}, {loading: Boolean, step: Number, fill: number}> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      fill: 60,
      loading: false
    };
  }

  async go() {
    const {web3} = this.props;

    let commitPoolContract = web3.contracts.commitPool;
    commitPoolContract = commitPoolContract.connect(web3.provider.getSigner());

    await commitPoolContract.processCommitmentUser();
    this.props.next(4);
  }

  render() {
    return (
        <View style={{backgroundColor: '#D45353', flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
            {this.props.success ? <ConfettiCannon count={100} origin={{x: 100, y: 0}} /> : ""}
            {this.props.success ? 
              <View style={{alignItems: 'center'}}>
                  <Text style={{fontSize: 50, color: 'white'}}>Congrats!</Text>
                  <Text style={{fontSize: 30, color: 'white', marginBottom: 25}}>Commitment Complete</Text>
                  <Text style={{fontSize: 50, marginBottom: 25}}>✔️</Text>
              </View>
              :
              <View style={{alignItems: 'center'}}>
                  <Text style={{fontSize: 50, color: 'white'}}>Doh!</Text>
                  <Text style={{fontSize: 30, color: 'white', marginBottom: 25}}>Commitment Missed</Text>
                  <Text style={{fontSize: 50, marginBottom: 25}}></Text>
              </View>
            }
            <TouchableOpacity
                    style={{width: 300, height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}
                    onPress={() => this.go()}>
                <Text style={{fontSize: 30}}>
                  {this.props.success ? "Claim Reward" : "Re-Commit"}
                </Text>
            </TouchableOpacity>
        </View>
    );
  }
}