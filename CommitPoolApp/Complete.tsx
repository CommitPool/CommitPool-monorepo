import React, { Component } from "react";
import { View, StyleSheet, Image, Text, Button, TouchableOpacity } from "react-native";
import { ethers, utils } from 'ethers';
import abi from '../CommitPoolContract/out/abi/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json'
import ConfettiCannon from 'react-native-confetti-cannon';

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
    const url = 'https://rpc-mumbai.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56'

    const provider = new ethers.providers.JsonRpcProvider(url);
    
    let privateKey = this.props.account.signingKey.privateKey;
    let wallet = new ethers.Wallet(privateKey);
    
    wallet = wallet.connect(provider);
    
    let contractAddress = '0xc129A3E263e05b73685b87cffC69695eB6240eaf';
    let contract = new ethers.Contract(contractAddress, abi, provider);
    
    contract = contract.connect(wallet);

    await contract.processAndSettleUser();
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