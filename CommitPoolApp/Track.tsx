import React, { Component } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { ethers } from 'ethers';
import { AsyncStorage } from 'react-native';
import getEnvVars from "./environment.js";

export default class Track extends Component <{next: any, account: any, code: string, web3Helper: any}, {refreshToken: string, type: string, account:any, total: number, startTime: Number, endTime: Number, loading: Boolean, step: Number, fill: number, goal: number, accessToken: String}> {
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
    this.setAccount();

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

  setAccount() {
    const web3 = this.props.web3Helper;
    this.setState({account: web3.account})
  }

  async getCommitment() {    
    const web3  = this.props.web3Helper;
    let commitPoolContract = web3.contracts.commitPool;

    const commitment = await commitPoolContract.commitments(this.state.account);

    const type = await commitPoolContract.activities(commitment['activityKey'])
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
    const web3 = this.props.web3Helper;
    const { account } = this.state;
    let commitPoolContract = web3.contracts.commitPool;
    const {commitPoolContractAddress} = getEnvVars();

    let contractWithSigner = commitPoolContract.connect(web3.provider.getSigner(0));
    
    this.setState({loading: true})
    try {
        await contractWithSigner.requestActivityDistance(account, commitPoolContractAddress, 'e21d39b70cad42d6bc6b42c64b853007', {gasLimit: 500000});

        let topic = ethers.utils.id("RequestActivityDistanceFulfilled(bytes32,uint256,address)");

        let filter = {
            address: commitPoolContractAddress,
            topics: [ topic ]
        }

        web3.provider.on(filter, async (result, event) => {
            const address = "0x" + result.topics[3].substr(26,66).toLowerCase()
            const now = new Date().getTime();
            if(address === this.props.account.signingKey.address.toLowerCase()){
              const commitment = await commitPoolContract.commitments(account)
              if(commitment.reportedValue.gte(commitment.goalValue)){
                this.setState({loading: false})
                this.props.next(7)
              } else if(now < commitment.endTime * 1000) {
                this.setState({loading: false})
                alert("Goal not yet achieved. Keep going!")
              } else {
                this.setState({loading: false});
                this.props.next(8);
              }
            }
        });
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
                <Text style={{fontSize: 30}}>Complete Goal</Text>
            </TouchableOpacity>
        </View>
    );
  }
}