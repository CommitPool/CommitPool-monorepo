import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import abi from '../CommitPoolContract/out/abi/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json'
import ConfettiCannon from 'react-native-confetti-cannon';
import getWallet from './components/wallet/wallet';
import getContract from './components/contract/contract';

export default class Complete extends Component <{success: boolean, next: any, account: any}, {loading: Boolean, step: Number, fill: number}> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      fill: 60,
      loading: false
    };
  }

  async go() {
    let privateKey = this.props.account.signingKey.privateKey;
    let wallet = getWallet(privateKey);
    
    let commitPoolContractAddress = '0x286Bcf38B881743401773a3206B907901b47359E';
    let commitPoolContract = getContract(commitPoolContractAddress, abi);
    
    commitPoolContract = commitPoolContract.connect(wallet);

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