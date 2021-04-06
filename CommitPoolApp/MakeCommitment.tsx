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
import txHelper from "./components/transactions/transaction-helper.js";
import { ethers, utils } from "ethers";
import { recoverTypedSignature_v4 } from "eth-sig-util";
import DropDownPicker from "react-native-dropdown-picker";

const {
  abi,
  daiAbi,
  daiContractAddress,
  commitPoolContractAddress,
} = getEnvVars();

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
  const [txHash, setTxHash] = useState("");
  const [metaTxEnabled, setMetaTxEnabled] = useState(true);
  
  const [activity, setActivity] = useState({});
  const [activities, setActivities] = useState([] as any[]);
  const [daysToStart, setDaysToStart] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [stake, setStake] = useState(0);


  //Get activities
  useEffect(() => {
    const getActivities = async () => {
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

    getActivities();
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

  // Transaction methods
  // Create and send commitment
  const createCommitment = async () => {
    const { account, provider } = web3provider;

    const distanceInMiles = Math.floor(distance);
    const startTime = calculateStart(daysToStart);
    const startTimestamp = Math.ceil(startTime.valueOf() / 1000); //to seconds
    const endTimestamp = Math.ceil(
      calculateEnd(startTime, duration).valueOf() / 1000
    ); //to seconds
    const stakeAmount = utils.parseEther(stake.toString());

    const commitment = {
      activityKey: activity,
      goalValue: distanceInMiles,
      startTime: startTimestamp,
      endTime: endTimestamp,
      stake: stakeAmount,
      depositAmount: stakeAmount,
      userId: code.athlete.id.toString(),
    };

    const _overrides = { from: account, gasLimit: 500000 };

    const daiFilter = {
      address: daiContractAddress,
      topics: [utils.id("Approval(address, address, uint256)")],
    };

    const spcFilter = {
      address: commitPoolContractAddress,
      topics: [
        utils.id(
          "NewCommitment(address, string, uint256, uint256, uint256, uint256)"
        ),
      ],
    };

    // setLoading(true);

    try {
      let daiReceipt;
      let spcReceipt;

      if (metaTxEnabled) {
        showInfoMessage("Sending metatransactions");
        //TODO on signing no signatute values received
        // await txHelper
        //   .signAndSendDaiApproval(web3provider, _overrides)
        //   .then(async (receipt) => {
        //     daiReceipt = receipt;
        //     spcReceipt = await txHelper.signAndSendDepositAndCommit(
        //       web3provider,
        //       commitment,
        //       _overrides
        //     );
        //   });

        spcReceipt = await txHelper.signAndSendDepositAndCommit(
          web3provider,
          commitment,
        _overrides
        );
      } else {
        showErrorMessage(
          "Not able to execute meta transaction, cancelling operation"
        );
      }

      // Monitor for dai Approval event
      await provider.once(daiFilter, (transaction) => {
        showInfoMessage(`dai Tx: ${transaction}`);
        setTxHash(transaction.transactionHash);
      });

      //Monitor for spc NewCommitment event
      await provider.once(spcFilter, (transaction) => {
        showInfoMessage(`spc Tx: ${transaction}`);
        setTxHash(transaction.transactionHash);
      });

      setLoading(false);
    } catch (error) {
      console.log("ERROR: ", error);
      setLoading(false);
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
