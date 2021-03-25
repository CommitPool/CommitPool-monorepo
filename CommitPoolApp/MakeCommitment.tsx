import React, { useState, useEffect } from "react";
import {
  StyledBackdropDark,
  StyledView,
  StyledViewContainer,
  StyledViewRow,
  StyledText,
  StyledTextInput,
  StyledTextLarge,
  StyledTouchableOpacityRed,
} from "./components/styles";
import getEnvVars from "./environment.js";
import { ethers, utils } from "ethers";
import { recoverTypedSignature_v4 } from "eth-sig-util";
import DropDownPicker from "react-native-dropdown-picker";

const { daiAbi, commitPoolContractAddress, daiContractAddress } = getEnvVars();

const domainType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
  {
    name: "salt",
    type: "bytes32",
  },
];

const metaTransactionType = [
  { name: "nonce", type: "uint256" },
  { name: "from", type: "address" },
  { name: "functionSignature", type: "bytes" },
];

const domainData = {
  name: "(PoS) Dai Stablecoin",
  version: "1",
  verifyingContract: daiContractAddress,
  salt: "0x" + (80001).toString(16).padStart(64, "0"),
};

const showErrorMessage = (message: string) => {
  console.log("ERROR: ", message);
};
const showInfoMessage = (message: string) => {
  console.log("INFO: ", message);
};
const showSuccessMessage = (message: string) => {
  console.log("SUCCESS: ", message);
};

const MakeCommitment = ({ code, next, web3 }) => {
  const [web3provider, setWeb3Provider] = useState(web3);
  const [loading, setLoading] = useState(true);
  const [distance, setDistance] = useState(0);
  const [stake, setStake] = useState(0);
  const [daysToStart, setDaysToStart] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activity, setActivity] = useState({});
  const [activities, setActivities] = useState([] as any[]);
  const [txHash, setTxHash] = useState("");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);

  //Get activities
  useEffect(() => {
    const init = async () => {
      if (web3provider.torus.isLoggedIn && web3provider.contracts !== {}) {
        const commitPoolContract = web3provider.contracts.commitPool;

        let activities = [];
        let exists = true;
        let index = 0;

        while (exists) {
          try {
            const key = await commitPoolContract.activityKeyList(index);
            const activity = await commitPoolContract.activities(key);
            const clone = Object.assign({}, activity);
            clone.key = key;
            activities.push(clone);
            index++;
            setLoading(false);
          } catch (error) {
            exists = false;
          }
          // console.log("GOT ACTIVITIES", activities);
        }

        const formattedActivities: {}[] = activities.map((act) => {
          if (act[0] === "Run") {
            return {
              label: "Run 🏃‍♂️",
              value: act.key,
            };
          } else if (act[0] === "Ride") {
            return {
              label: "Ride 🚲",
              value: act.key,
            };
          } else {
            return {
              label: act[0],
              value: act.key,
            };
          }
        });

        console.log("FORMATTED ACTIVITIES: ", formattedActivities);

        setActivities(formattedActivities);
        setActivity(formattedActivities[0]);
      }
    };

    init();
  }, []);

  // Commitment methods

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const calculateStart = (_daysToStart: number) => {
    if (_daysToStart === 0) {
      const result = new Date();
      return result;
    } else {
      const result = addDays(new Date(), _daysToStart);
      result.setHours(0, 0, 0, 0); //start at next day 00:00
      return result;
    }
  };

  const calculateEnd = (_startTime: Date, _duration: number) => {
    const result = addDays(_startTime, _duration);
    result.setHours(24, 0, 0, 0); //give until end of day
    return result;
  };

  const getActivityName = () => {
    if (!Array.isArray(activities) || !activities.length) {
      return activities.find((act: any) => act.value === activity).label;
    }
  };

  // Permit methods

  // const createPermitMessageData = () => {
  //   const { account, contracts } = web3provider;
  //   const fromAddress = account;
  //   const expiry = Date.now() + 120;
  //   const nonce = 1;
  //   const spender = contracts.commitPool.address;

  //   const message = {
  //     holder: fromAddress,
  //     spender: spender,
  //     nonce: nonce,
  //     expiry: expiry,
  //     allowed: true,
  //   };

  //   const typedData = JSON.stringify({
  //     types: {
  //       EIP712Domain: [
  //         {
  //           name: "name",
  //           type: "string",
  //         },
  //         {
  //           name: "version",
  //           type: "string",
  //         },
  //         {
  //           name: "chainId",
  //           type: "uint256",
  //         },
  //         {
  //           name: "verifyingContract",
  //           type: "address",
  //         },
  //       ],
  //     },
  //     primaryType: "Permit",

  //     message: message,
  //   });

  //   return {
  //     typedData,
  //     message,
  //   };
  // };

  // const signData = async (typedData: any) => {
  //   const { account, biconomy, torus } = web3provider;
  //   const provider = torus.provider;
  //   console.log("PROVIDER TO SIGN DATA: ", provider);
  //   return new Promise(function (resolve, reject) {
  //     provider.sendAsync(
  //       {
  //         id: 1,
  //         method: "eth_signTypedData_v3",
  //         params: [account, typedData],
  //         from: account,
  //       },
  //       function (err, result) {
  //         if (err) {
  //           console.log(err);
  //           reject(err); //TODO
  //         } else {
  //           const r = result.result.slice(0, 66);
  //           const s = "0x" + result.result.slice(66, 130);
  //           const v = Number("0x" + result.result.slice(130, 132));
  //           resolve({
  //             v,
  //             r,
  //             s,
  //           });
  //         }
  //       }
  //     );
  //   });
  // };

  // const signTransferPermit = async () => {
  //   const messageData = createPermitMessageData();
  //   const sig = await signData(messageData.typedData);
  //   return Object.assign({}, sig, messageData.message);
  // };

  const getSignatureParameters = (signature: any) => {
    if (!utils.isHexString(signature)) {
      throw new Error(
        'Given value "'.concat(signature, '" is not a valid hex string.')
      );
    }
    let expanded = utils.splitSignature(signature);
    return expanded;
  };

  // Create and send commitment
  const createCommitment = async () => {
    const { account, biconomy, contracts, provider, torus } = web3provider;
    // const provider = biconomy.getEthersProvider();
    const gasLimit = 500000;
    const _overrides = { from: account, gasLimit: gasLimit };
    const daiContract = contracts.dai;
    const daiInterface = new ethers.utils.Interface(daiAbi);

    // let commitPoolContract = contracts.commitPool;

    // const distanceInMiles = Math.floor(distance);
    // const startTime = calculateStart(daysToStart);
    // const startTimestamp = Math.ceil(startTime.valueOf() / 1000); //to seconds
    // const endTimestamp = Math.ceil(
    //   calculateEnd(startTime, duration).valueOf() / 1000
    // ); //to seconds
    // const stakeAmount = utils.parseEther(stake.toString());
    // setLoading(true);

    // const allowance = await daiContract.allowance(
    //   account,
    //   commitPoolContract.address
    // );

    try {
      let dcReceipt;

      if (metaTxEnabled) {
        console.log("Sending metaTx");

        //spender, amount
        const userAddress = account;
        // const nonce = await daiContract.getNonce(userAddress);
        const nonce = "1"; //TODO because only contract, quick solve
        const functionSignature = daiInterface.encodeFunctionData("approve",[
          commitPoolContractAddress,
          "10000000000000000000"]
        );
        // .encodeABI();
        console.log("FUNCTION SIGNATURE RESP: ", functionSignature);
        let message = {};
        message.nonce = parseInt(nonce);
        message.from = userAddress;
        message.functionSignature = functionSignature;

        const dataToSign = JSON.stringify({
          types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType,
          },
          domain: domainData,
          primaryType: "MetaTransaction",
          message: message,
        });
        console.log("Domain data: ", domainData);

        dcReceipt = await torus.provider.send(
          {
            jsonrpc: "2.0",
            id: 999999999999,
            method: "eth_signTypedData_v4",
            params: [userAddress, dataToSign],
          },
          function (error, response) {
            console.info(`User signature is ${response.result}`);
            if (error || (response && response.error)) {
              showErrorMessage("Could not get user signature");
            } else if (response && response.result) {
              let { r, s, v } = getSignatureParameters(response.result);
              console.log(userAddress);
              console.log(JSON.stringify(message));
              console.log(message);
              console.log(getSignatureParameters(response.result));

              const recovered = recoverTypedSignature_v4({
                data: JSON.parse(dataToSign),
                sig: response.result,
              });
              console.log(`Recovered ${recovered}`);
              sendTransaction(userAddress, functionSignature, r, s, v);
            }
          }
        );

        // const {
        //   data,
        // } = await commitPoolContract.populateTransaction.depositAndCommit(
        //   activity,
        //   distanceInMiles * 100,
        //   startTimestamp,
        //   endTimestamp,
        //   stakeAmount,
        //   stakeAmount,
        //   String(code.athlete.id)
        // );

        // console.log("Data: ", data);

        // txParams = {
        //   data: data,
        //   to: commitPoolContract.address,
        //   from: account,
        //   gasLimit: gasLimit,
        //   signatureType: "EIP712_SIGN",
        // };
      } else {
        // const signedTransferPermit = await signTransferPermit();
        // console.log("SIGNED PERMIT: ", signedTransferPermit);
        // const { expiry, nonce, v, r, s } = signedTransferPermit;
        // console.log("V, R, S: ", v, " ", r, " ", s);
        // const {
        //   data,
        // } = await commitPoolContract.populateTransaction.depositAndCommitPermit(
        //   activity,
        //   distanceInMiles * 100,
        //   startTimestamp,
        //   endTimestamp,
        //   stakeAmount,
        //   stakeAmount,
        //   nonce,
        //   Math.floor(expiry / 1000),
        //   v,
        //   r,
        //   s,
        //   String(code.athlete.id)
        // );
        // console.log("Data: ", data);
        // txParams = {
        //   data: data,
        //   to: commitPoolContract.address,
        //   from: account,
        //   gasLimit: gasLimit,
        //   signatureType: "EIP712_SIGN",
        // };
      }

      // const dcReceipt = await provider.send("eth_sendTransaction", [txParams]);
      console.log("RECEIPT: ", dcReceipt);
      console.log("Sending transaction");
      await provider.once(dcReceipt, (transaction) => {
        console.log("TX: ", transaction);
        setTxHash(transaction.transactionHash);
      });

      setLoading(false);
    } catch (error) {
      console.log("ERROR: ", error);
      setLoading(false);
    }
  };

  const sendTransaction = async (userAddress, functionData, r, s, v) => {
    if (web3provider && web3provider.contracts !== {}) {
      console.log("WEB# PROVIDER IN SEND: ", web3provider);
      const { contracts, provider } = web3provider;
      console.log("CONTRACTS IN SEND: ", contracts);

      try {
        let gasPrice = await provider.getGasPrice();

        // let gasLimit = await contracts.dai.estimateGas.executeMetaTransaction(
        //   userAddress,
        //   functionData,
        //   r,
        //   s,
        //   v,{
        //     from: userAddress,
        //     gasLimit: 250000,
        //   }
        // ).then(out => console.log("OUT: ", out));
        // .estimateGas({ from: userAddress });
        let tx = contracts.dai.executeMetaTransaction(
          userAddress,
          functionData,
          r,
          s,
          v,
          {
            from: userAddress,
            gasLimit: 500000,
          }
        );
        // .send({
        //   from: userAddress,
        // });
        console.log("TX: ", tx);

        tx.on("transactionHash", function (hash) {
          console.log(`Transaction hash is ${hash}`);
          showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
        }).once("confirmation", function (confirmationNumber, receipt) {
          console.log(receipt);
          setTxHash(receipt.transactionHash);
          showSuccessMessage("Transaction confirmed on chain");
          // getQuoteFromNetwork();
        });
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <StyledViewContainer>
      {loading ? (
        <StyledBackdropDark>
          <StyledText>⌛</StyledText>
        </StyledBackdropDark>
      ) : undefined}

      {txHash === "" ? (
        <StyledView>
          <StyledTextLarge style={{ fontWeight: "bold" }}>
            Create Commitment {"\n\n"}
          </StyledTextLarge>
          <StyledText>
            {
              "Now that you've connected Strava and have funds in your wallet, you can set up your commitment! \n\n"
            }
          </StyledText>
          <StyledViewRow
            style={{
              zIndex: 5000,
            }}
          >
            <StyledText style={{ fontWeight: "bold" }}>Activity:</StyledText>
            <DropDownPicker
              items={activities}
              containerStyle={{ height: 40 }}
              style={{ backgroundColor: "#fafafa", width: 135 }}
              itemStyle={{
                justifyContent: "flex-start",
              }}
              dropDownStyle={{ backgroundColor: "#fafafa" }}
              onChangeItem={(item) => {
                console.log("change", item);
                setActivity(item.value);
              }}
            />
          </StyledViewRow>
          <StyledViewRow>
            <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
              Distance:
            </StyledText>
            <StyledTextInput
              onChangeText={(text: string) => setDistance(Number(text))}
            ></StyledTextInput>
            <StyledText style={{ textAlign: "left" }}> Miles</StyledText>
          </StyledViewRow>
          <StyledViewRow>
            <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
              Stake:
            </StyledText>
            <StyledTextInput
              onChangeText={(text: string) => setStake(Number(text))}
            ></StyledTextInput>
            <StyledText style={{ textAlign: "left" }}> DAI</StyledText>
          </StyledViewRow>
          <StyledViewRow>
            <StyledText
              style={{
                fontWeight: "bold",
              }}
            >
              Starting in
            </StyledText>
            <StyledTextInput
              onChangeText={(text: string) => setDaysToStart(Number(text))}
            ></StyledTextInput>
            <StyledText style={{ textAlign: "left" }}>day(s)</StyledText>
          </StyledViewRow>

          <StyledViewRow>
            <StyledText>for</StyledText>
            <StyledTextInput
              onChangeText={(text: string) => setDuration(Number(text))}
            ></StyledTextInput>
            <StyledText style={{ textAlign: "left" }}> day(s)</StyledText>
          </StyledViewRow>
          <StyledTouchableOpacityRed onPress={() => createCommitment()}>
            <StyledText>Stake and Commit</StyledText>
          </StyledTouchableOpacityRed>
        </StyledView>
      ) : (
        <StyledView>
          {loading ? (
            <StyledBackdropDark>
              <StyledText>⌛</StyledText>
            </StyledBackdropDark>
          ) : undefined}
          <StyledTextLarge>Commitment Created</StyledTextLarge>
          <StyledTextLarge>✔️</StyledTextLarge>
          <StyledViewRow>
            <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
              Activity:
            </StyledText>
            <StyledText style={{ marginLeft: 10 }}>
              {getActivityName()}
            </StyledText>
          </StyledViewRow>
          <StyledViewRow>
            <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
              Distance:
            </StyledText>
            <StyledText style={{ marginLeft: 10 }}>{distance} Miles</StyledText>
          </StyledViewRow>
          <StyledViewRow>
            <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
              Stake:
            </StyledText>
            <StyledText style={{ marginLeft: 10 }}>{stake} DAI</StyledText>
          </StyledViewRow>
          <StyledViewRow>
            <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
              Starting in{" "}
            </StyledText>
            <StyledText style={{ marginLeft: 10 }}>
              {daysToStart} day(s)
            </StyledText>
          </StyledViewRow>
          <StyledViewRow>
            <StyledText style={{ textAlign: "right", fontWeight: "bold" }}>
              for
            </StyledText>
            <StyledText style={{ marginLeft: 10 }}>
              {duration} day(s)
            </StyledText>
          </StyledViewRow>

          <StyledTouchableOpacityRed onPress={() => next(6)}>
            <StyledText style={{ marginBottom: 0 }}>Track Progress</StyledText>
          </StyledTouchableOpacityRed>
        </StyledView>
      )}
    </StyledViewContainer>
  );
};

export default MakeCommitment;
