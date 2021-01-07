import React, { Component } from "react";
import { View,  Text, TouchableOpacity, TextInput } from "react-native";
import { ethers, utils } from 'ethers';
import abi from '../commitpool-contract-singleplayer/out/abi/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json'
import daiAbi from './daiAbi.json'
import { Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export default class MakeCommitment extends Component <{next: any, provider: any, code: any}, {account: any, txSent: Boolean, loading: Boolean, distance: Number, stake: Number,daysToStart: Number, duration: Number,  activity: {}, activities: any}> {
  contract: any;
  contractAddress: string;
  daiContract: any;
  daiContractAddress: string
  constructor(props) {
    super(props);
    this.contractAddress = "0x104caee222E39eAd76F646daf601FD2302CBf164";
    this.daiContractAddress = "0x70d1f773a9f81c852087b77f6ae6d3032b02d2ab";
    this.state = {
      account: undefined,
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
    await this.props.provider
    .listAccounts()
    .then((accounts) => {
      this.setState({ account: accounts[0] });
    })
;
    const signer = await this.props.provider.getSigner()
    this.contract = await new ethers.Contract(this.contractAddress, abi, signer);
    this.daiContract = await new ethers.Contract(this.daiContractAddress, daiAbi, signer);

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

  async createCommitment() {    
    const distanceInMiles = Math.floor(this.state.distance);
    const startTime = this.calculateStart(this.state.daysToStart);
    const startTimestamp = Math.ceil(startTime.valueOf() /1000); //to seconds
    const endTimestamp = Math.ceil(this.calculateEnd(startTime, this.state.duration).valueOf() /1000); //to seconds    
    const stakeAmount = utils.parseEther(this.state.stake.toString());
    this.setState({loading: true})
    
    const allowance = await this.daiContract.allowance(this.state.account, '0x104caee222E39eAd76F646daf601FD2302CBf164');
    if(allowance.gte(stakeAmount)) {
      await this.contract.depositAndCommit(this.state.activity, distanceInMiles * 100, startTimestamp, endTimestamp, stakeAmount, stakeAmount, String(this.props.code.athlete.id), {gasLimit: 5000000});
    } else {
      await this.daiContract.approve('0x104caee222E39eAd76F646daf601FD2302CBf164', stakeAmount)
      await this.contract.depositAndCommit(this.state.activity, distanceInMiles * 100, startTimestamp, endTimestamp, stakeAmount, stakeAmount, String(this.props.code.athlete.id), {gasLimit: 5000000});
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