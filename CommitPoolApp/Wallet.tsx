import React, { useEffect, useState } from "react";
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

const Wallet = ({ next, web3 }) => {
  const [web3provider, setWeb3Provider] = useState(web3);
  const [balance, setBalance] = useState("0.0");
  const [daiBalance, setDaiBalance] = useState("0.0");
  const [loading, setLoading] = useState(true);

  //Set-up wallet
  useEffect(() => {
    if (loading) {
      web3provider
        .initialize()
        .then((provider) => setWeb3Provider(provider))
        .then(setLoading(false));
    }
  }, [loading, web3provider]);

  //Set balances and refresh
  useEffect(() => {
    if (!loading) {
      const refresh = setInterval(async () => {
        const { account, contracts, torus } = web3provider;
        if (torus.isLoggedIn) {
          if (account !== undefined) {
            console.log("ACCOUNT WEB3 in wallet: ", account);
            await getUserBalance().then((balance) =>
              setBalance(utils.formatEther(balance))
            );
          }
          if (contracts.dai !== undefined) {
            console.log("DAI CONTRACT: ", web3.contracts.dai);

            await getDaiBalance().then((daiBalance) =>
              setDaiBalance(utils.formatEther(daiBalance))
            );
          }
        }
      }, 2500);

      return () => clearInterval(refresh);
    }
  }, [loading]);

  const getUserBalance = async () => {
    const { account, provider } = web3provider;
    if (account !== undefined) {
      return await provider.getBalance(account);
    }
    return "0.0";
  };

  const getDaiBalance = async () => {
    const { account, contracts } = web3provider;
    if (account !== undefined && contracts.dai !== undefined) {
      return await contracts.dai.balanceOf(account);
    }
    return "0.0";
  };

  const logout = () => {
    web3provider.logOut();
    setBalance("0.0");
    setDaiBalance("0.0");
    setLoading(true);
  };

  const goNext = async () => {
    const { account, contracts } = web3provider;
    const commitPoolContract = contracts.commitPool;

    try {
      const commitment = await commitPoolContract.commitments(account);
      if (commitment.exists) {
        next(6);
      } else {
        next(5);
      }
    } catch (error) {
      next(5);
    }
  };

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
          onPress={() => Clipboard.setString(web3provider.account)}
        >
          {web3provider.account}
        </StyledTextSmall>
      </StyledView>

      {loading ? (
        <StyledText>Loading....</StyledText>
      ) : (
        <StyledView>
          <StyledText
            style={{
              fontWeight: "bold",
            }}
          >
            Balance:
          </StyledText>
          <StyledText style={{ marginBottom: 15 }}>
            {balance} MATIC 
          </StyledText>
          <StyledText style={{ marginBottom: 15 }}>{daiBalance} mDAI</StyledText>
          <StyledTouchableOpacityRed
            onPress={() => goNext()}
            style={{ marginBottom: 15 }}
          >
            <StyledText>Get Started!</StyledText>
          </StyledTouchableOpacityRed>
          <StyledTouchableOpacityRed onPress={() => logout()}>
            <StyledText>
              {web3provider.torus.isLoggedIn ? "Log out" : " Log in"}
            </StyledText>
          </StyledTouchableOpacityRed>
        </StyledView>
      )}
    </StyledViewContainer>
  );
};

export default Wallet;
