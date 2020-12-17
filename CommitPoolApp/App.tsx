import React, { useState, useEffect }  from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Account from "@tasit/account";
import { Dimensions } from 'react-native';
import { AsyncStorage } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import Main from './Main'

WebBrowser.maybeCompleteAuthSession();

// Endpoint
const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
  tokenEndpoint: 'https://www.strava.com/oauth/token',
  revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

import * as Random from "expo-random";

export default function App() {  
  const [code, setCode] = useState(true); 
  const { width } = Dimensions.get('window');

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: '51548',
      scopes: ['read,activity:read'],
      // For usage in managed apps using the proxy
      redirectUri: makeRedirectUri({
        // For usage in bare and standalone
        // the "redirect" must match your "Authorization Callback Domain" in the Strava dev console.
        native: 'your.app://redirect',
      }),
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      fetch('https://www.strava.com/oauth/token?client_id=51548&client_secret=28d56211b9ca33972055bf61010074fbedc3c7c2&code=' + response.params.code + '&grant_type=authorization_code',
        {
          method: 'POST'
        })
        .then(res => res.json())
        .then(async (json) => {
          console.log(json)
          await AsyncStorage.setItem(
            'rt',
            json.refresh_token
          );
          setCode(json);
          createUser(json.athlete.id, json.refresh_token)
        })
    }
  }, [response]);

  const stravaOauth = () => {
    promptAsync()
  }

  const createUser = async (address, token) => {
    await fetch('https://test2.dcl.properties/user', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({address: address, token: token})
    });
  }
  
  return (
    <Home stravaOauth={stravaOauth} code={code}></Home>
  )

}

class Home extends React.Component <{stravaOauth: any, code: string}, {}> {
  state = {
    accessToken: "",
    message: "Awaiting accesstoken",
    address: "",
    account: undefined
  };

  async componentDidMount() {
    const accountString = await this._retrieveData('account')

    if(!accountString) {
      this.getAccount();
    } else {
      this.setAccount(accountString);
    }
  }

  async getAccount() {
    async function makeAccount() {
      const randomBytes = await Random.getRandomBytesAsync(16);
  
      const account = Account.createUsingRandomness(randomBytes);
      const address = account.address;
      return {address, account}
    }
    const {address, account} = await makeAccount();
    this._storeData('account', JSON.stringify(account))

    this.setState({address: address, account: account})
  }

  setAccount(accountString: string) {
    const account = JSON.parse(accountString)
    console.log(account)

    this.setState({address: account.signingKey.address, account: account})
  }

  _storeData = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(
        key,
        value
      );
    } catch (error) {
      // Error saving data
    }
  };

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

  render() {
    return (
      <Main account={this.state.account} stravaOAuth={this.props.stravaOauth} code={this.props.code}></Main>
    );
  }
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    //backgroundColor: '#282c34',
    color: 'whitesmoke',
  },

linearGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width,
    borderRadius: 5
  },

  AppHeader: {
    backgroundColor: '#282c34',
    // min-height: 80vh;
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // font-size: calc(10px + 2vmin);
    color: 'white'
  }
});