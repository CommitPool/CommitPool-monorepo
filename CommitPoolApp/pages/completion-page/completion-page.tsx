import React, { useEffect, useState } from "react";
import ConfettiCannon from "react-native-confetti-cannon";

import {
  Box,
  useToast,
  Button,
  ButtonGroup,
  Center,
  Heading,
  IconButton,
  Link,
  Text,
  Spinner,
  VStack,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

import { LayoutContainer, Footer } from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";

import strings from "../../resources/strings";
import { Transaction } from "ethers";
import { TransactionTypes } from "../../types";
import { useContracts } from "../../contexts/contractContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import usePlausible from "../../hooks/usePlausible";
import { useInjectedProvider } from "../../contexts/injectedProviderContext";

type CompletionPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Completion"
>;

type CompletionPageProps = {
  navigation: CompletionPageNavigationProps;
};

const CompletionPage = ({ navigation }: CompletionPageProps) => {
  const { trackPageview } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/completion",
  });
  const [waiting, setWaiting] = useState<boolean>(false);
  const toast = useToast();

  const { commitment, refreshCommitment } = useCommitPool();
  const { spcContract } = useContracts();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();
  const [success, setSuccess] = useState<boolean>(false);

  const methodCall: TransactionTypes = "processCommitmentUser";
  const txUrl = latestTransaction?.tx?.hash
    ? `https://polygonscan.com/tx/${latestTransaction.tx.hash}`
    : "";

  //Check is commitment was met
  useEffect(() => {
    if (commitment?.reportedValue && commitment?.goalValue) {
      const _success =
        commitment.reportedValue > 0 &&
        commitment.reportedValue >= commitment.goalValue;
      setSuccess(_success);
    }
  }, [commitment]);

  useEffect(() => {
    const awaitTransaction = async () => {
      setWaiting(true);
      try {
        toast({
          title: "Awaiting transaction confirmation",
          description: "Please hold on",
          status: "success",
          duration: null,
          isClosable: true,
          position: "top",
        });

        const receipt = await latestTransaction.tx.wait();

        if (receipt && receipt.status === 0) {
          setWaiting(false);
          toast({
            title: "Transaction failed",
            description: "Please check your tx on Polygonscan and try again",
            status: "error",
            duration: null,
            isClosable: false,
            position: "top",
          });
        }

        if (receipt && receipt.status === 1) {
          toast({
            title: "Commitment processed!",
            description: null,
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          refreshCommitment();
          setWaiting(false);
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

  const achievement = `You managed to ${commitment?.activityName?.toLowerCase()} for ${
    commitment?.reportedValue
  } miles. You committed to ${commitment?.goalValue} miles`;

  const onProcess = async () => {
    if (currentUser?.username && spcContract) {
      console.log("Web3 logged in, calling processCommitmentUser()");
      await spcContract.processCommitmentUser().then((tx: Transaction) => {
        console.log("processCommitmentUserTX: ", tx);
        setLatestTransaction({
          methodCall,
          tx,
        });
      });
    } else {
      console.log("Web3 not logged in, routing to login");
      navigation.navigate("Login");
    }
  };

  const listenForCommitmentSettlement = () => {
    if (spcContract) {
      spcContract.on(
        "CommitmentEnded",
        async (committer: string, met: boolean, amountPenalized: number) => {
          if (
            committer.toLowerCase() === currentUser?.username?.toLowerCase()
          ) {
            navigation.navigate("Login");
          }
        }
      );
    }
  };

  listenForCommitmentSettlement();

  return (
    <LayoutContainer>
      {success && !waiting ? (
        <Box>
          <ConfettiCannon count={100} origin={{ x: 0, y: 0 }} fadeOut={true} />
          <Heading>{strings.completion.success}</Heading>
        </Box>
      ) : undefined}

      {!success && !waiting ? (
        <Heading>{strings.completion.fail}</Heading>
      ) : undefined}

      <VStack h="80%">
        <Text mt="20%">{achievement}</Text>

        {latestTransaction.methodCall === methodCall && waiting ? (
          <VStack spacing={15} h="60%">
            <Text>Awaiting transaction processing</Text>
            <Spinner size="xl" thickness="5px" speed="1s" />
            <Link href={txUrl} isExternal target="_blank">
              View transaction on Polygonscan <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        ) : (
          <Center h="90%">
            <Button onClick={() => onProcess()}>Process commitment</Button>
          </Center>
        )}
      </VStack>
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={() => navigation.navigate("ActivityGoal")}>
            Restart
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

export default CompletionPage;
