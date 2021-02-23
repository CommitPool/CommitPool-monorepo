import React, { Component } from "react";
import { Clipboard } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { utils } from "ethers";
import {
  StyledTouchableOpacityRed,
  StyledText,
  StyledTextLarge,
  StyledTextSmall,
  StyledView,
  StyledViewContainer,
} from "./components/styles";

export default class Wallet extends Component<
  { next: any; web3: any },
  { balance: string; daiBalance: string; refresh: any }
> {
  constructor(props) {
    super(props);
    this.state = {
      balance: "0.0",
      daiBalance: "0.0",
      refresh: undefined,
    };
  }

  async componentDidMount() {
    const web3 = await this.props.web3.initialize();
    this.setStateInfo(web3);
    this.setStateRefresh(web3);
  }

  componentWillUnmount() {
    clearInterval(this.state.refresh);
  }

  async setStateInfo(web3: any) {
    const account = web3.provider.provider.selectedAddress;

    await web3.provider
      .getBalance(account)
      .then((balance) =>
        this.setState({ balance: utils.formatEther(balance) })
      );

    await web3.contracts.dai
      .balanceOf(account)
      .then((daiBalance) =>
        this.setState({ daiBalance: utils.formatEther(daiBalance) })
      );
  }

  async setStateRefresh(web3: any) {
    const refresh = setInterval(async () => {
      if (web3.provider !== undefined) {
        const account = web3.provider.provider.selectedAddress;

        await web3.provider
          .getBalance(account)
          .then((balance) =>
            this.setState({ balance: utils.formatEther(balance) })
          );

        await web3.contracts.dai
          .balanceOf(account)
          .then((daiBalance) =>
            this.setState({ daiBalance: utils.formatEther(daiBalance) })
          );
      }
    }, 2500);
    this.setState({ refresh: refresh });
  }

  logout = () => {
    this.props.web3.logOut();
    this.setState({ balance: "0", daiBalance: "0" });
    clearInterval(this.state.refresh);
  };

  async next() {
    const { web3 } = this.props;
    const account = web3.provider.provider.selectedAddress;
    const commitPoolContract = web3.contracts.commitPool;

    try {
      const commitment = await commitPoolContract.commitments(account);
      if (commitment.exists) {
        this.props.next(6);
      } else {
        this.props.next(5);
      }
    } catch (error) {
      this.props.next(5);
    }
  }

  render() {
    const { web3 } = this.props;
    const account = web3.torus.isLoggedIn
      ? web3.provider.provider.selectedAddress
      : "";
    return (
      <StyledViewContainer>
        <StyledView>
          <StyledTextLarge style={{ marginBottom: 70 }}>
            Add Funds
          </StyledTextLarge>
          <StyledText
            style={{
              marginBottom: 10,
            }}
          >
            Login to your wallet via Torus by clicking the blue button below.
          </StyledText>
          <StyledTextSmall style={{ marginBottom: 70 }}>
            You can get funds on testnet from https://faucet.matic.network
          </StyledTextSmall>
          <QRCode value="account" size={225} />
          <StyledTextSmall
            onPress={() => Clipboard.setString(account)}
            style={{ marginTop: 10 }}
          >
            {account}
          </StyledTextSmall>
          <StyledText
            style={{
              marginTop: 25,
              fontWeight: "bold",
            }}
          >
            Balances:
          </StyledText>
          <StyledText>{this.state.balance} MATIC</StyledText>
          <StyledText>{this.state.daiBalance} MATIC Dai</StyledText>
        </StyledView>
        <StyledTouchableOpacityRed onPress={() => this.next()}>
          <StyledText style={{ marginBottom: 0 }}>Get Started!</StyledText>
        </StyledTouchableOpacityRed>
        <StyledTouchableOpacityRed
          onPress={() =>
            web3.torus.isLoggedIn ? this.logout() : web3.initialize()
          }
        >
          <StyledText style={{ marginBottom: 0 }}>
            {web3.torus.isLoggedIn ? "Log out" : " Log in"}
          </StyledText>
        </StyledTouchableOpacityRed>
      </StyledViewContainer>
    );
  }
}
