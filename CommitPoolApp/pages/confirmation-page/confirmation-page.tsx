import React, { useEffect, useState } from "react";

import {
  Button,
  ButtonGroup,
  IconButton,
  Image,
  Text,
  useToast,
  VStack,
  Spinner,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon, QuestionIcon } from "@chakra-ui/icons";

import {
  LayoutContainer,
  Footer,
  ProgressBar,
  CommitmentOverview,
} from "../../components";
import { RootStackParamList } from "..";
import { StackNavigationProp } from "@react-navigation/stack";

import strings from "../../resources/strings";

import {
  validCommitmentRequest,
  getCommitmentRequestParameters,
} from "../../utils/commitment";
import { Transaction } from "ethers";
import { useContracts } from "../../contexts/contractContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useStrava } from "../../contexts/stravaContext";
import usePlausible from "../../hooks/usePlausible";
import { TransactionTypes } from "../../types";
import { useInjectedProvider } from "../../contexts/injectedProviderContext";

type ConfirmationPageNavigationProps = StackNavigationProp<
  RootStackParamList,
  "Confirmation"
>;

type ConfirmationPageProps = {
  navigation: ConfirmationPageNavigationProps;
};

const ConfirmationPage = ({ navigation }: ConfirmationPageProps) => {
  const { trackPageview, trackEvent } = usePlausible();
  trackPageview({
    url: "https://app.commitpool.com/confirmation",
  });

  const toast = useToast();
  const [waiting, setWaiting] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const { commitment, activities, refreshCommitment } = useCommitPool();
  const { athlete } = useStrava();
  const { currentUser, latestTransaction, setLatestTransaction } =
    useCurrentUser();
  const { daiContract, spcContract } = useContracts();
  const methodCall: TransactionTypes = "depositAndCommit";

  const txUrl = latestTransaction?.tx?.hash
    ? `https://polygonscan.com/tx/${latestTransaction.tx.hash}`
    : "";

  useEffect(() => {
    const awaitTransaction = async () => {
      setWaiting(true);
      try {
        toast({
          title: "Awaiting transaction confirmation",
          description: "Please hold on",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });

        const receipt = await latestTransaction.tx.wait()
        console.log("Receipt: ", receipt)

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
        }

        if (receipt && receipt.status === 1) {
          toast({
            title: "You're committed!",
            description: "Let's check your progress",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          refreshCommitment();
          navigation.navigate("Track");
          setWaiting(false);
        }
      } catch {
        console.log("Got error on latest Tx: ", latestTransaction);
        setWaiting(false);
        toast({
          title: "Transaction failed",
          description: "Please check your tx on Polygonscan and try again",
          status: "error",
          duration: 5000,
          isClosable: false,
          position: "top",
        });
      }
    };

    if (latestTransaction.methodCall === methodCall) {
      awaitTransaction();
    }
  }, [latestTransaction]);

  const createCommitment = async () => {
    trackEvent("spc_create_commitment");
    if (
      commitment &&
      activities &&
      validCommitmentRequest(commitment, activities) &&
      spcContract &&
      daiContract &&
      athlete &&
      currentUser.attributes?.["custom:account_address"]
    ) {
      const allowance = await daiContract.allowance(
        currentUser.attributes["custom:account_address"],
        spcContract.address
      );

      const _commitmentParameters = getCommitmentRequestParameters(commitment);
      const _commitmentParametersWithUserId = {
        ..._commitmentParameters,
        _userId: String(athlete.id),
      };

      console.log(
        "Commitment request with user ID: ",
        _commitmentParametersWithUserId
      );

      if (allowance.gte(_commitmentParameters._stake)) {
        console.log("Submitting D&C tx");
        await spcContract
          .depositAndCommit(
            _commitmentParametersWithUserId._activityKey,
            _commitmentParametersWithUserId._goalValue,
            _commitmentParametersWithUserId._startTime,
            _commitmentParametersWithUserId._endTime,
            _commitmentParametersWithUserId._stake,
            _commitmentParametersWithUserId._depositAmount,
            _commitmentParametersWithUserId._userId,
            { gasLimit: 5000000 }
          )
          .then((tx: Transaction) => {
            console.log("Updating latest Tx: ", tx);
            setLatestTransaction({
              methodCall,
              tx,
            });
          });
      } else {
        console.log("Getting allowance with DAI contract: ", daiContract);

        await daiContract
          .approve(spcContract.address, _commitmentParametersWithUserId._stake)
          .then((tx: Transaction) => {
            toast({
              title: "DAI approval requested",
              description: "Let's commit!",
              status: "success",
              duration: 5000,
              isClosable: true,
              position: "top",
            });
          });

        console.log("Calling D&C with SPC contract: ", spcContract);
        await spcContract
          .depositAndCommit(
            _commitmentParametersWithUserId._activityKey,
            _commitmentParametersWithUserId._goalValue,
            _commitmentParametersWithUserId._startTime,
            _commitmentParametersWithUserId._endTime,
            _commitmentParametersWithUserId._stake,
            _commitmentParametersWithUserId._depositAmount,
            _commitmentParametersWithUserId._userId,
            { gasLimit: 5000000 }
          )
          .then((tx: Transaction) =>
            setLatestTransaction({
              methodCall,
              tx,
            })
          );
      }
    } else {
      toast({
        title: "Activity not complete",
        description: "Please check your values and try again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  return (
    <LayoutContainer>
      <ProgressBar size={5} />
      <VStack mt={10}>
        <Text>
          {`${strings.activitySource.loggedIn.text} ${athlete?.firstname}`}
        </Text>
        <Image
          borderRadius="full"
          boxSize="50px"
          src={athlete?.profile_medium}
        />
      </VStack>
      <VStack mt="2em" h="80%">
        {waiting ? (
          <VStack spacing={15} h="60%">
            <Text>Awaiting transaction processing</Text>
            <Spinner size="xl" thickness="5px" speed="1s" />
            <Link href={txUrl} isExternal target="_blank">
              View transaction on Polygonscan <ExternalLinkIcon mx="2px" />
            </Link>
          </VStack>
        ) : (
          <VStack>
            <CommitmentOverview editing={editMode} />
            {editMode ? (
              <Button
                onClick={() => {
                  setEditMode(false);
                }}
              >
                Set
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setEditMode(true);
                }}
              >
                Edit
              </Button>
            )}
          </VStack>
        )}
      </VStack>
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <Button onClick={async () => createCommitment()}>
            {strings.footer.next}
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

export default ConfirmationPage;
