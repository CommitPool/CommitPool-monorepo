import React, { Component } from "react";
import { View, StyleSheet, Image, Text, Button, TouchableOpacity } from "react-native";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { ethers } from 'ethers';
import { AsyncStorage } from 'react-native';
import { Moment } from 'moment';
import abi from './abi.json'

export default class Track extends Component <{next: any, account: any, code: string}, {refreshToken: string, type: string, account:any, total: number, startTime: Number, endTime: Number, loading: Boolean, step: Number, fill: number, goal: number, accessToken: String}> {
  constructor(props) {
    super(props);
    this.state = {
      account: {},
      refreshToken: '',
      step: 1,
      fill: 0,
      loading: false,
      goal: 0,
      total: 0,
      startTime: 0,
      endTime: 0,
      type: '',
      accessToken: ''
    };
  }

  async componentDidMount() {
    const refreshToken: any = await this._retrieveData('rt')
    console.log(refreshToken)
    this.setState({refreshToken: refreshToken})
    const accountString: any = await this._retrieveData('account')
    this.setAccount(accountString);

    fetch('https://www.strava.com/api/v3/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: 51548,
          client_secret: '28d56211b9ca33972055bf61010074fbedc3c7c2',
          refresh_token: this.state.refreshToken,
          grant_type: 'refresh_token'
        })
    }).then(res => res.json())
    .then((json) => {
      this.setState({accessToken: json.access_token});
    })

    this.getCommitment()
  }

  _retrieveData = async (key: string) => {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value !== null) {
        // We have data!!
        return value;
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  setAccount(accountString: string) {
    const account = JSON.parse(accountString)
    console.log(account)
    this.setState({account: account})
  }

  async getCommitment() {    
    const url = 'https://rpc-mumbai.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56'

    const provider = new ethers.providers.JsonRpcProvider(url);    
    let privateKey = this.state.account.signingKey.privateKey;
    let wallet = new ethers.Wallet(privateKey);
    
    wallet = wallet.connect(provider);
    
    let contractAddress = '0x251B6f95F6A17D2aa350456f616a84b733380eBE';
    let contract = new ethers.Contract(contractAddress, abi, provider);

    const commitment = await contract.commitments(this.state.account.signingKey.address)
    console.log(commitment)

    const type = await contract.activities(commitment['activityKey'])
    this.setState({
      goal: commitment['goalValue'].toNumber() / 100,
      startTime: commitment['startTime'].toNumber(),
      endTime: commitment['endTime'].toNumber(),
      type: type[0]
    })

    this.getActivity();

    this.setState({fill: this.state.total / this.state.goal})
  }

  async getActivity() {
    fetch('https://test2.dcl.properties/activities?startTime=' + this.state.startTime + '&endTime=' + this.state.endTime + '&type=' + this.state.type + '&accessToken=' + this.state.accessToken,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer: ' + this.state.accessToken
        }
      })
      .then(res => res.json())
      .then((json) => {
        this.setState({total: json.total})
        this.setState({fill: this.state.total / this.state.goal})
      })
  }

  async getUpdatedActivity() {
    
    const url = 'https://rpc-mumbai.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56'

    const provider = new ethers.providers.JsonRpcProvider(url);
    
    let privateKey = this.props.account.signingKey.privateKey;
    let wallet = new ethers.Wallet(privateKey);
    
    wallet = wallet.connect(provider);

    
    let contractAddress = '0x251B6f95F6A17D2aa350456f616a84b733380eBE';
    let contract = new ethers.Contract(contractAddress, abi, provider);

    let contractWithSigner = contract.connect(wallet);
    
    this.setState({loading: true})
    try {
        console.log(this.props.account.signingKey.address)
        await contractWithSigner.requestActivityDistance(this.props.account.signingKey.address, '0x1cf7D49BE7e0c6AC30dEd720623490B64F572E17', 'd8fcf41ee8984d3b8b0eae7b74eca7dd', {gasLimit: 500000});
        this.setState({loading: false})
        this.props.next(7)
    } catch (error) {
        console.log(error)
        this.setState({loading: false})
    }
  }

  render() {
    return (
        <View style={{backgroundColor: '#D45353', flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
            {this.state.loading ? <View style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 0, left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2}}><Text style={{fontSize: 25}}>⌛</Text></View> : undefined}
            <View style={{alignItems: 'center'}}>
                <Text style={{fontSize: 50, color: 'white', marginBottom: 70}}>Track</Text>
                <AnimatedCircularProgress
                    size={180}
                    width={15}
                    rotation={0}
                    fill={this.state.fill}
                    tintColor="white"
                    onAnimationComplete={() => console.log('onAnimationComplete')}
                    backgroundColor="#D45353" >
                    {
                        (fill) => (
                        <Text style={{color: 'white', fontSize: 30}}>
                            {this.state.fill.toFixed(1)}%
                        </Text>
                        )
                    }
                </AnimatedCircularProgress>
                <Text style={{fontSize: 22, color: 'white', marginTop: 25}}>{((this.state.fill/100) * this.state.goal).toFixed(1)}/{this.state.goal} Miles</Text>
            </View>
            <TouchableOpacity
                    style={this.state.fill !== 100 ? {width: 300, height: 50, backgroundColor: '#999', alignItems: 'center', justifyContent: 'center'}
                        : {width: 300, height: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'}}
                    onPress={() => this.getUpdatedActivity()}
                    >
                <Text style={{fontSize: 30}}>Claim Reward</Text>
            </TouchableOpacity>
        </View>
    );
  }
}