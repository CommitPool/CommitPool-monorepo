import React, { Component } from "react";
import { Clipboard } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Contract, utils } from "ethers";
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
    await this.props.web3.initialize().then((web3) => {
      this.setStateInfo(web3);
      this.setStateRefresh(web3);
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.refresh);
  }

  async setStateInfo(web3: any) {
    const account = web3.account;

    if (web3.account !== undefined && web3.contracts.dai !== undefined) {
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
  }

  async setStateRefresh(web3: any) {
    const refresh = setInterval(async () => {
      if (web3.account !== undefined && web3.contracts.dai !== undefined) {
        const account = web3.account;
        console.log("ACCOUNT WEB3 in wallet: ", account);
        await web3.provider
          .getBalance(account)
          .then((balance) =>
            this.setState({ balance: utils.formatEther(balance) })
          );

        console.log("DAI CONTRACT: ", web3.contracts.dai);
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
    const account = web3.account;
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
    console.log("WEB3", web3);
    const account = web3.account !== undefined ? web3.account : "";
    return (
      <StyledViewContainer>
        <StyledView>
          <StyledTextLarge style={{ margin: 15 }}>Add Funds</StyledTextLarge>
          <StyledText style={{ margin: 15 }}>
            Login to your wallet via Torus by clicking the blue button below.
          </StyledText>
          <StyledTextSmall style={{ margin: 15 }}>
            You can get funds on testnet from https://faucet.matic.network
          </StyledTextSmall>
          <QRCode value="account" size={225} />
          <StyledTextSmall
            style={{ margin: 15 }}
            onPress={() => Clipboard.setString(account)}
          >
            {account}
          </StyledTextSmall>
        </StyledView>

        {web3.biconomy !== undefined ? (
          <StyledView>
            <StyledText
              style={{
                fontWeight: "bold",
              }}
            >
              Balance:
            </StyledText>
            <StyledText style={{ marginBottom: 15 }}>
              {this.state.daiBalance} DAI
            </StyledText>
            <StyledTouchableOpacityRed
              onPress={() => this.next()}
              style={{ marginBottom: 15 }}
            >
              <StyledText>Get Started!</StyledText>
            </StyledTouchableOpacityRed>
            <StyledTouchableOpacityRed
              onPress={() =>
                web3.torus.isLoggedIn ? this.logout() : web3.initialize()
              }
            >
              <StyledText>
                {web3.torus.isLoggedIn ? "Log out" : " Log in"}
              </StyledText>
            </StyledTouchableOpacityRed>
          </StyledView>
        ) : (
          <StyledText>Loading....</StyledText>
        )}
      </StyledViewContainer>
    );
  }
}
