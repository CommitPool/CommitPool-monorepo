import React, { Component } from "react";
import { View, StyleSheet, Image, Text, Button, TouchableOpacity } from "react-native";

export default class Commit extends Component <{next: any}, {step: Number}> {
  constructor(props) {
    super(props);
    this.state = {
      step: 1
    };
  }

  go = () => {

  }

  render() {
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'space-around'}}>
            <Text style={{ color: 'white', fontSize: 30, textAlign: 'center'}}>
               {"Now you're set-up with Strava and funds, you can set your goals and stake."} 
            </Text>
            <TouchableOpacity
                    style={{width: 300, height: 50, backgroundColor: '#D45353', alignItems: 'center', justifyContent: 'center'}}
                    onPress={() => this.props.next(6)}>
                <Text style={{fontSize: 30, color:'white'  }}>Let's Go!</Text>
            </TouchableOpacity>
        </View>
    );
  }
}