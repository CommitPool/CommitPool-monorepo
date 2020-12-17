import React, { Component } from "react";
import { View, StyleSheet, Image, Text, Button, TouchableOpacity, TextInput } from "react-native";
import { ethers, utils } from 'ethers';
import abi from './abi.json'
import daiAbi from './daiAbi.json'
import { Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default class MakeCommitment extends Component <{next: any, account: any, code: any}, {txSent: Boolean, loading: Boolean, distance: Number, stake: Number, activity: {}, activities: any}> {
  contract: any;
  daiContract: any;
  constructor(props) {
    super(props);
    
    this.state = {
      distance: 0,
      stake: 0,
      loading: false,
      txSent: false,
      activity: {},
      activities: []
    };
  }

  async componentDidMount() {
    const url = 'https://rpc-mumbai.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56'

    const provider = new ethers.providers.JsonRpcProvider(url);
    
    let privateKey = this.props.account.signingKey.privateKey;
    let wallet = new ethers.Wallet(privateKey);
    
    wallet = wallet.connect(provider);
    
    let contractAddress = '0x251B6f95F6A17D2aa350456f616a84b733380eBE';
    let contract = new ethers.Contract(contractAddress, abi, provider);

    let daiAddress = '0x70d1f773a9f81c852087b77f6ae6d3032b02d2ab';
    let daiContract = new ethers.Contract(daiAddress, daiAbi, provider);
    
    this.contract = contract.connect(wallet);
    this.daiContract = daiContract.connect(wallet);


    let activities = [];
    let exists = true;
    let index = 0;

    while (exists){
      try {
        const key = await this.contract.activityKeyList(index);
        const activity = await this.contract.activities(key);
        const clone = Object.assign({}, activity)
        clone.key = key;
        activities.push(clone);
        index++;
      } catch (error) {
        console.log(error)
        exists = false;
      }
    }

    const formattedActivities = activities.map(act => {
      if(act[0] === 'Run') {
        return {
          label: 'Run 🏃‍♂️',
          value: act.key
        }
      } else if (act[0] === 'Ride') {
        return {
          label: 'Ride 🚲',
          value: act.key
        }
      } else {
        return {
          label: act[0],
          value: act.key
        }
      }
    })

    this.setState({activities: formattedActivities, activity: formattedActivities[0]})
  }

  async createCommitment() {    
    const distanceInMiles = Math.floor(this.state.distance);
    const startTime = Math.ceil(new Date().getTime() / 1000) + 60;
    const stakeAmount = utils.parseEther(this.state.stake.toString());
    this.setState({loading: true})
    
    const allowance = await this.daiContract.allowance(this.props.account.signingKey.address, '0x251B6f95F6A17D2aa350456f616a84b733380eBE');
    if(allowance.gte(stakeAmount)) {
      await this.contract.depositAndCommit(this.state.activity, distanceInMiles * 100, startTime, stakeAmount, stakeAmount, String(this.props.code.athlete.id), {gasLimit: 5000000});
    } else {
      await this.daiContract.approve('0x251B6f95F6A17D2aa350456f616a84b733380eBE', stakeAmount)
      await this.contract.depositAndCommit(this.state.activity, distanceInMiles * 100, startTime, stakeAmount, stakeAmount, String(this.props.code.athlete.id), {gasLimit: 5000000});
    }

    this.setState({loading: false, txSent: true})
  }


  getActivityName() {
    return this.state.activities.find((act: any) => act.value === this.state.activity).label;
  }

  render() {

    const { width } = Dimensions.get('window');

    return (
        <View style={{flex: 1, width, alignItems: 'center', justifyContent: 'space-around'}}>
            {this.state.loading ? <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 0, left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2}}><Text style={{fontSize: 25}}>⌛</Text></View> : undefined}
            {!this.state.txSent ? 
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
                <View style={{alignItems: 'center'}}>
                <Text style={{ color: 'white', fontSize: 30, textAlign: 'center', marginBottom: 25}}>
               {"Now that you've connected Strava and have funds in your wallet, you can set up your commitment!"} 
            </Text>
                    <Text style={{fontSize: 30, color: 'white', marginBottom: 25, textAlign: 'center'}}>Create Commitment</Text>
                    <View style={{flexDirection: "row", width: 300, padding: 10, zIndex: 5000}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Activity:</Text>
                        <DropDownPicker
                            items={this.state.activities}
                            containerStyle={{height: 40}}
                            style={{backgroundColor: '#fafafa', width: 135}}
                            itemStyle={{
                                justifyContent: 'flex-start'
                            }}
                            dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChangeItem={item => {
                                console.log("change", item)
                                this.setState({activity: item.value})
                            }}
                        />
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Distance:</Text>
                        <View style={{flex: 1, flexDirection: 'row', marginLeft: 10}}>
                            <TextInput style={{textAlign:'center', borderRadius: 5, backgroundColor: 'white', fontSize: 28, color: 'black', width: 30 + '%'}} onChangeText={text => this.setState({distance: Number(text)})}></TextInput><Text style={{flex: 1, color: 'white', fontSize: 28}}> Miles</Text>
                        </View>                    
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Stake:</Text>
                        <View style={{flex: 1, flexDirection: 'row', marginLeft: 10}}>
                            <TextInput style={{textAlign:'center', borderRadius: 5, backgroundColor: 'white', fontSize: 28, color: 'black', width: 30 + '%'}} onChangeText={text => this.setState({stake: Number(text)})}></TextInput><Text style={{flex: 1, color: 'white', fontSize: 28}}> Dai</Text>
                        </View>
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Deadline:</Text>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, marginLeft: 10}}>2 Days</Text>
                    </View>
                </View>

                <TouchableOpacity
                        style={{width: 300, height: 50, backgroundColor: '#D45353', alignItems: 'center', justifyContent: 'center'}}
                        onPress={() => this.createCommitment()}>
                    <Text style={{fontSize: 30, color: 'white'}}>Stake and Commit</Text>
                </TouchableOpacity>
            </View>
            :
            <View style={{backgroundColor: '#D45353', flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
                {this.state.loading ? <View style={{alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 0, left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2}}><Text style={{fontSize: 25}}>⌛</Text></View> : undefined}
                <View style={{alignItems: 'center'}}>
                    <Text style={{fontSize: 50, color: 'white', marginBottom: 25, textAlign: 'center'}}>Commitment Created</Text>
                    <Text style={{fontSize: 50, marginBottom: 25}}>✔️</Text>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Activity:</Text>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, marginLeft: 10}}>{this.getActivityName()}</Text>
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Distance:</Text>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, marginLeft: 10}}>{this.state.distance} Miles</Text>                 
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Stake:</Text>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, marginLeft: 10}}>{this.state.stake} Dai</Text>
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Deadline:</Text>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, marginLeft: 10}}>2 Days</Text>
                    </View>
                    <Text style={{color: 'white', fontSize: 30, marginTop: 25}}>View on Etherscan <Image style={{width: 20, height: 20}} source={require('./assets/arrow-popout.svg')}></Image></Text>
                </View>

                <TouchableOpacity
                        style={{width: 300, height: 50, backgroundColor: '#D45353', alignItems: 'center', justifyContent: 'center'}}
                        onPress={() => this.props.next(7)}>
                    <Text style={{fontSize: 30, color:'white'}}>Track Progress</Text>
                </TouchableOpacity>
            </View>}
        </View>
        
    );
  }
}