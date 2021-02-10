import React, { Component } from "react";
import { View, Text, TouchableOpacity, Clipboard } from "react-native";
import QRCode from 'react-native-qrcode-svg';
import getContract from './components/contract/contract';
import getWallet from './components/wallet/wallet';
import getEnvVars from './environment.js';

export default class Wallet extends Component <{next: any, account: any}, {balance: number, daiBalance: number, commitment: any}> {
  abi: any;
  commitPoolContractAddress: string;
  daiAbi: any;
  daiContractAddress: string;

  constructor(props) {
    super(props);
    
    const { commitPoolContractAddress, daiContractAddress, abi, daiAbi } = getEnvVars();
    this.commitPoolContractAddress = commitPoolContractAddress;
    this.daiContractAddress = daiContractAddress;
    this.abi = abi;
    this.daiAbi = daiAbi;

    this.state = {
      balance: 0.0,
      daiBalance: 0.0,
      commitment: undefined
    };
  }

  async componentDidMount() {    
    let privateKey = this.props.account.signingKey.privateKey;
    let wallet = getWallet(privateKey);

    const daiContract = getContract(this.daiContractAddress, this.daiAbi);

    const daiBalance = await daiContract.balanceOf(this.props.account.signingKey.address);
    const balance = await wallet.getBalance();

    this.setState({balance: balance.div(1000000000000000).toNumber() / 1000})
    this.setState({daiBalance: daiBalance.div(1000000000000000).toNumber() / 1000})

    setInterval(async () => {
      const daiBalance = await daiContract.balanceOf(this.props.account.signingKey.address)
      const balance = await wallet.getBalance();
      this.setState({balance: balance.div(1000000000000000).toNumber() / 1000})
      this.setState({daiBalance: daiBalance.div(1000000000000000).toNumber() / 1000})
    }, 2500)
  }

  async next() {
    const commitPoolContract = getContract(this.commitPoolContractAddress, this.abi);

    try {
      const commitment = await commitPoolContract.commitments(this.props.account.signingKey.address);
      console.log(commitment)
      if(commitment.exists){
        this.props.next(6)
      } else {
        this.props.next(5)
      }
    } catch (error) {
      this.props.next(5)
    }
  }

  render() {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>

            <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 50, color: 'white', marginBottom: 70}}>Add Funds</Text>
                <Text style={{fontSize: 20, textAlign: 'center', color: 'white', marginBottom: 10}}>This is your local wallet. We've created one for you here in your browser. 
                {"\n"}
                All you need to do is add funds by transferring them to this wallet's adddress below.</Text>
                <Text style={{fontSize: 15, color: 'white', marginBottom: 70}}>You can get funds on testnet from https://faucet.matic.network</Text>
                <QRCode
                    value="this.props.account.signingKey.address"
                    size={225}
                />
                <Text onPress={()=>Clipboard.setString(this.props.account.signingKey.address)} style={{fontSize: 14, color: 'white', marginTop: 10}}>{this.props.account.signingKey.address}</Text>
                <Text style={{fontSize: 30, color: 'white', marginTop: 25, fontWeight: 'bold'}}>Balances:</Text>
                <Text style={{fontSize: 30, color: 'white', marginTop: 25}}>{this.state.balance} MATIC</Text>
                <Text style={{fontSize: 30, color: 'white', marginTop: 25}}>{this.state.daiBalance} MATIC Dai</Text>
            </View>
            <TouchableOpacity
                    style={{width: 300, height: 50, backgroundColor: '#D45353', alignItems: 'center', justifyContent: 'center'}}
                    onPress={() => this.next()}>
                <Text style={{fontSize: 30, color: 'white'}}>Get Started!</Text>
            </TouchableOpacity>
        </View>
    );
  }
}