import React, { Component } from "react";
import { Clipboard, Dimensions } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { utils } from "ethers";
import {
  StyledTouchableOpacityRed,
  StyledTouchableOpacityWhite,
  StyledText,
  StyledTextDark,
  StyledTextLarge,
  StyledTextSmall,
  StyledView,
  StyledViewContainer,
} from "./components/styles";

export default class Wallet extends Component<
  { next: any; web3: any },
  {
    balance: string;
    daiBalance: string;
    refresh: any;
    height: any;
    width: any;
    loading: any;
    commitmentExists: boolean;
  }
> {
  constructor(props) {
    super(props);
    this.state = {
      balance: "0.0",
      daiBalance: "0.0",
      refresh: undefined,
      height: 300,
      width: 300,
      loading: true,
      commitmentExists: false,
    };
  }

  updateDimensions() {
    const { width, height } = Dimensions.get("window");
    this.setState({ width: width, height: height });
  }

  async componentDidMount() {
    this.updateDimensions();
    window.addEventListener("resize", this.updateDimensions.bind(this));
    await this.login();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
    clearInterval(this.state.refresh);
  }

  async setStateInfo(web3: any) {
    if (web3.account !== undefined && web3.contracts !== undefined) {
      const account = web3.account;
      const { commitPool, dai } = web3.contracts;

      //MATIC balance
      await web3.provider
        .getBalance(account)
        .then((balance) =>
          this.setState({ balance: utils.formatEther(balance) })
        );

      //DAI balance
      await dai
        .balanceOf(account)
        .then((daiBalance) =>
          this.setState({ daiBalance: utils.formatEther(daiBalance) })
        );

      //Commitment
      await commitPool.commitments(account).then((commitment) => {
        commitment.exists
          ? this.setState({ commitmentExists: true })
          : this.setState({ commitmentExists: false });

        if (this.state.loading) {
          this.setState({ loading: false });
        }
      });
    }
  }

  async setStateRefresh(web3: any) {
    const refresh = setInterval(async () => {
      this.setStateInfo(web3);
    }, 2500);
    this.setState({ refresh: refresh });
  }

  logout = async () => {
    await this.props.web3
      .logOut()
      .then(clearInterval(this.state.refresh))
      .then(
        this.setState({
          balance: "0",
          daiBalance: "0",
          loading: true,
          commitmentExists: false,
          refresh: undefined,
        })
      );
  };

  login = async () => {
    await this.props.web3.initialize().then((web3Helper) => {
      this.setStateInfo(web3Helper);
      this.setStateRefresh(web3Helper);
    });
  };

  async next() {
    try {
      if (this.state.commitmentExists) {
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
    const account = web3.isLoggedIn ? web3.account : "";
    console.log("Web3.account: ", web3.account);
    return (
      <StyledViewContainer>
        <StyledView>
          <StyledTextLarge style={{ margin: 15 }}>Add Funds</StyledTextLarge>
          {account ? (
            <QRCode value={account} size={225} />
          ) : (
            <div style={{ height: 225 }}></div>
          )}
          <StyledTextSmall
            style={{ margin: 15 }}
            onPress={() => Clipboard.setString(account)}
          >
            {account}
          </StyledTextSmall>
          <StyledText
            style={{
              fontWeight: "bold",
            }}
          >
            Balances:
          </StyledText>
          <StyledText style={{ margin: 15 }}>
            {this.state.balance} MATIC
          </StyledText>
          <StyledText style={{ marginBottom: 15 }}>
            {this.state.daiBalance} MATIC Dai
          </StyledText>
        </StyledView>
        {this.state.loading ? undefined : (
          <StyledTouchableOpacityWhite onPress={() => this.next()}>
            <StyledTextDark>
              {this.state.commitmentExists
                ? "Track commitment"
                : "Get Started!"}
            </StyledTextDark>
          </StyledTouchableOpacityWhite>
        )}
        <StyledTouchableOpacityWhite
          onPress={async () =>
            web3.isLoggedIn ? await this.logout() : await this.login()
          }
        >
          <StyledTextDark>
            {web3.isLoggedIn ? "Log out" : " Log in"}
          </StyledTextDark>
        </StyledTouchableOpacityWhite>
      </StyledViewContainer>
    );
  }
}
