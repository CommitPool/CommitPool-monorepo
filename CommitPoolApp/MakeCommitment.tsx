import React, { Component } from "react";
import getEnvVars from "./environment.js";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { ethers, utils } from 'ethers';
import { Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default class MakeCommitment extends Component <{next: any, account: any, code: any, web3Helper: any}, {txSent: Boolean, loading: Boolean, distance: Number, stake: Number,daysToStart: Number, duration: Number,  activity: {}, activities: any}> {
;
  constructor(props) {
    super(props);
   
    this.state = {
      distance: 0,
      stake: 0,
      daysToStart: 0,
      duration: 0,
      loading: false,
      txSent: false,
      activity: {},
      activities: []
    };
  }

  async componentDidMount() {
    const web3 = this.props.web3Helper;
    
    let commitPoolContract = web3.contracts.commitPool;

    console.log("SPC:", commitPoolContract);
    let activities = [];
    let exists = true;
    let index = 0;

    while (exists){
      try {
        const key = await commitPoolContract.activityKeyList(index);
        const activity = await commitPoolContract.activities(key);
        const clone = Object.assign({}, activity)
        clone.key = key;
        activities.push(clone);
        index++;
      } catch (error) {
        exists = false;
      }
      console.log("GOT ACTIVITIES", activities);
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

  addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  calculateStart = (_daysToStart: number) => {
    if (_daysToStart === 0) {
      const result = new Date();
      return result;
    } else {
      const result = this.addDays(new Date(), _daysToStart);
      result.setHours(0,0,0,0); //start at next day 00:00
      return result;
    }
  }

  calculateEnd = (_startTime: Date, _duration: number) => {
    const result = this.addDays(_startTime, _duration)
    result.setHours(24,0,0,0); //give until end of day
    return result;
  }

  //TODO Commitment is not created
  async createCommitment() {   
    const web3 = this.props.web3Helper;
    const account = web3.account;

    let commitPoolContract = web3.contracts.commitPool;
    commitPoolContract = commitPoolContract.connect(web3.provider.getSigner());

    let daiContract = web3.contracts.dai;
    daiContract = daiContract.connect(web3.provider.getSigner());
 
    const {
      commitPoolContractAddress,
    } = getEnvVars();

    const distanceInMiles = Math.floor(this.state.distance);
    const startTime = this.calculateStart(this.state.daysToStart);
    const startTimestamp = Math.ceil(startTime.valueOf() /1000); //to seconds
    const endTimestamp = Math.ceil(this.calculateEnd(startTime, this.state.duration).valueOf() /1000); //to seconds    
    const stakeAmount = utils.parseEther(this.state.stake.toString());
    this.setState({loading: true})
    
    const allowance = await daiContract.allowance(account, commitPoolContractAddress);
    if(allowance.gte(stakeAmount)) {
      const dcReceipt = await commitPoolContract.depositAndCommit(this.state.activity, distanceInMiles * 100, startTimestamp, endTimestamp, stakeAmount, stakeAmount, String(this.props.code.athlete.id), {gasLimit: 5000000});
      console.log("RECEIPT D&C:", dcReceipt);
    } else {
      const daiReceipt = await daiContract.approve(commitPoolContractAddress, stakeAmount);
      const dcReceipt = await commitPoolContract.depositAndCommit(this.state.activity, distanceInMiles * 100, startTimestamp, endTimestamp, stakeAmount, stakeAmount, String(this.props.code.athlete.id), {gasLimit: 5000000});
      console.log("RECEIPT DAI:", daiReceipt);
      console.log("RECEIPT D&C:", dcReceipt);
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
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Starting in</Text>
                        <View style={{flex: 1, flexDirection: 'row', marginLeft: 10}}>
                            <TextInput style={{textAlign:'center', borderRadius: 5, backgroundColor: 'white', fontSize: 28, color: 'black', width: 30 + '%'}} onChangeText={text => this.setState({daysToStart: Number(text)})}></TextInput><Text style={{flex: 1, color: 'white', fontSize: 28}}> day(s)</Text>
                        </View>                    
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>for</Text>
                        <View style={{flex: 1, flexDirection: 'row', marginLeft: 10}}>
                            <TextInput style={{textAlign:'center', borderRadius: 5, backgroundColor: 'white', fontSize: 28, color: 'black', width: 30 + '%'}} onChangeText={text => this.setState({duration: Number(text)})}></TextInput><Text style={{flex: 1, color: 'white', fontSize: 28}}> day(s)</Text>
                        </View>                    
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
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>Starting in </Text>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, marginLeft: 10}}>{this.state.daysToStart} day(s)</Text>
                    </View>
                    <View style={{flexDirection: "row", width: 300, padding: 10}}>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, fontWeight: 'bold'}}>for</Text>
                        <Text style={{flex: 1, color: 'white', fontSize: 28, marginLeft: 10}}>{this.state.duration} day(s)</Text>
                    </View>
                </View>

                <TouchableOpacity
                        style={{width: 300, height: 50, backgroundColor: '#D45353', alignItems: 'center', justifyContent: 'center'}}
                        onPress={() => this.props.next(6)}>
                    <Text style={{fontSize: 30, color:'white'}}>Track Progress</Text>
                </TouchableOpacity>
            </View>}
        </View>
        
    );
  }
}