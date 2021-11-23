import React, { useEffect, useState } from "react";
import {
  Box,
  useToast,
  Button,
  ButtonGroup,
  Center,
  CircularProgress,
  CircularProgressLabel,
  Heading,
  IconButton,
  Link,
  Text,
  Spacer,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

import { LayoutContainer, Footer, ProgressBar } from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";
import strings from "../../resources/strings";
import { parseSecondTimestampToFullString } from "../../utils/dateTime";

import { BigNumber, Contract, Transaction } from "ethers";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useContracts } from "../../contexts/contractContext";
import { useStrava } from "../../contexts/stravaContext";
import { Commitment, TransactionTypes } from "../../types";
import { useCurrentUser } from "../../contexts/currentUserContext";
import usePlausible from "../../hooks/usePlausible";
import { useInjectedProvider } from "../../contexts/injectedProviderContext";
import { DateTime } from "luxon";

type TrackPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Track"
>;

type TrackPageProps = {
  navigation: TrackPageNavigationProps;
};

const TrackPage = ({ navigation }: TrackPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/track",
  });
  const toast = useToast();
  const [waiting, setWaiting] = useState<boolean>(false);
  const [commitmentExpired, setCommitmentExpired] = useState<boolean>(false);
  const { commitment, refreshCommitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { athlete } = useStrava();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();

  const methodCall: TransactionTypes = "requestActivityDistance";

  //TODO manage URL smart when 'undefined'
  const stravaUrl = athlete?.id
    ? `http://www.strava.com/athletes/${athlete.id}`
    : "";
  const txUrl = latestTransaction?.tx?.hash
    ? `https://polygonscan.com/tx/${latestTransaction.tx.hash}`
    : "";

  //to do - move to env and/or activity state
  const oracleAddress: string = "0x0a31078cD57d23bf9e8e8F1BA78356ca2090569E";
  const jobId: string = "692ce2ecba234a3f9a0c579f8bf7a4cb";

  useEffect(() => {
    const now = DateTime.now().toSeconds();
    if (commitment?.endTime) {
      const endTime = commitment.endTime;
      now > endTime ? setCommitmentExpired(true) : setCommitmentExpired(false);
    }
  }, [commitment]);

  const getCommitmentProgress = async () => {
    if (
      spcContract &&
      currentUser?.attributes?.["custom:account_address"] &&
      oracleAddress
    ) {
      await spcContract
        .requestActivityDistance(
          currentUser.attributes["custom:account_address"],
          oracleAddress,
          jobId,
          { gasLimit: 500000 }
        )
        .then((tx: Transaction) => {
          console.log("requestActivityDistanceTX receipt: ", tx);
          setLatestTransaction({
            methodCall,
            tx,
          });
        });
    }
  };

  const listenForActivityDistanceUpdate = (
    singlePlayerCommit: Contract,
    commitment: Partial<Commitment>
  ) => {
    const now = new Date().getTime() / 1000;

    if (commitment?.endTime) {
      singlePlayerCommit.on(
        "RequestActivityDistanceFulfilled",
        async (id: string, distance: BigNumber, committer: string) => {
          if (
            committer.toLowerCase() ===
            currentUser.attributes?.["custom:account_address"].toLowerCase()
          ) {
            if (commitment?.endTime && now > commitment.endTime) {
              navigation.navigate("Completion");
            } else {
              toast({
                title: "Not there yet!",
                description:
                  "Keep it up and check back in after your next activity",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "top",
              });
              refreshCommitment();
              setWaiting(false);
            }
          }
        }
      );
    }
  };

  if (spcContract && commitment) {
    listenForActivityDistanceUpdate(spcContract, commitment);
  }

  useEffect(() => {
    const awaitTransaction = async () => {
      setWaiting(true);
      try {
        const receipt = await latestTransaction.tx.wait();

        if (receipt && receipt.status === 0) {
          setWaiting(false);
          toast({
            title: "Transaction failed",
            description: "Please check your tx on Polygonscan and try again",
            status: "error",
            duration: 5000,
            isClosable: false,
            position: "top",
          });
        } else if (receipt && receipt.status === 1) {
          setWaiting(false);
          toast({
            title: "Activity progress updated!",
            description: null,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }
      } catch {
        console.log("Got error on latest Tx: ", latestTransaction);
        setWaiting(false);
      }
    };

    if (latestTransaction.methodCall === methodCall) {
      awaitTransaction();
    }
  }, [latestTransaction]);

  const onNext = async () => {
    if (commitmentExpired) {
      navigation.navigate("Completion");
    } else if (
      commitment?.reportedValue &&
      commitment?.goalValue &&
      commitment.reportedValue > commitment.goalValue
    ) {
      navigation.navigate("Completion");
    } else {
      await getCommitmentProgress();
    }
  };

  return (
    <LayoutContainer>
      <Center h="90%">
        {waiting ? (
          <VStack spacing={15} h="60%">
            <Text>Awaiting transaction processing</Text>
            <Spinner size="xl" thickness="5px" speed="1s" />
            <Link href={txUrl} isExternal target="_blank">
              View transaction on Polygonscan <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        ) : (
          <VStack align="center" w="90%">
            <Heading size="md">{strings.track.tracking.text}</Heading>
            {commitment?.startTime &&
            commitment?.endTime &&
            commitment?.activityName &&
            commitment?.goalValue &&
            commitment?.stake ? (
              <VStack>
                <Text as="em">
                  {`${
                    strings.confirmation.commitment.activity
                  } ${commitment?.activityName?.toLowerCase()} `}
                  {`${strings.confirmation.commitment.distance} ${commitment?.goalValue} miles `}
                  {`${
                    strings.confirmation.commitment.startDate
                  } ${parseSecondTimestampToFullString(
                    commitment?.startTime
                  )} `}
                  {`${
                    strings.confirmation.commitment.endDate
                  } ${parseSecondTimestampToFullString(commitment?.endTime)}`}
                </Text>
                <Spacer />
                <Heading size="md">Your stake</Heading>
                <Text>{`${commitment.stake} DAI`}</Text>
                <Spacer />
                <Heading size="md">Your progression</Heading>
                <CircularProgress
                  value={commitment?.progress || 0}
                  size="150px"
                  thickness="10px"
                >
                  <CircularProgressLabel fontSize="1.5rem">
                    {commitment?.progress?.toFixed(1) || 0} %
                  </CircularProgressLabel>
                </CircularProgress>
              </VStack>
            ) : undefined}
          </VStack>
        )}
      </Center>

      <Box mb="5">
        {stravaUrl ? (
          <Link href={stravaUrl} isExternal target="_blank">
            Open Strava Profile <ExternalLinkIcon mx="2px" />
          </Link>
        ) : (
          <Button onClick={() => navigation.navigate("ActivitySource")}>
            Login to Strava
          </Button>
        )}
      </Box>

      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => onNext()}>
            {commitmentExpired ||
            (commitment?.reportedValue &&
              commitment?.goalValue &&
              commitment.reportedValue > commitment.goalValue)
              ? "Process commitment"
              : "Update progress"}
          </Button>
          <IconButton
            aria-label="Go to FAQ"
            icon={<QuestionIcon />}
            onClick={() => navigation.navigate("Faq")}
          />
        </ButtonGroup>
      </Footer>
    </LayoutContainer>
  );
};

export default TrackPage;
