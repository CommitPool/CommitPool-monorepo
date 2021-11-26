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
  FormControl,
  FormLabel,
  Switch,
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

import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useStrava } from "../../contexts/stravaContext";
import usePlausible from "../../hooks/usePlausible";
import { TransactionTypes } from "../../types";

import CommitmentConfirmationButton from "../../components/confirmation-button/commitment-confirmation-button.component";
import { handleAndNotifyTxProcessing } from "../../utils/contractInteractions";
import { useContracts } from "../../contexts/contractContext";

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
  const [sufficientAllowance, setSufficientAllowance] =
    useState<boolean>(false);
  const [infinite, setInfinite] = useState<boolean>(true);

  const { spcContract } = useContracts();
  const { commitment, refreshCommitment } = useCommitPool();
  const { athlete } = useStrava();
  const {
    currentUser,
    latestTransaction,
    refreshDaiAllowance,
    setLatestTransaction,
  } = useCurrentUser();

  const methodCallDepositAndCommit: TransactionTypes = "depositAndCommit";
  const methodCallApprove: TransactionTypes = "approve";

  const txUrl = latestTransaction?.tx?.hash
    ? `https://polygonscan.com/tx/${latestTransaction.tx.hash}`
    : "";

  useEffect(() => {
    if (commitment?.stake && currentUser.daiAllowance) {
      const stake = Number(commitment.stake);
      const allowance = Number(currentUser.daiAllowance);
      console.log("STAKE: ", stake);
      console.log("ALLOWANCE: ", allowance);

      stake <= allowance
        ? setSufficientAllowance(true)
        : setSufficientAllowance(false);
    }
  }, [commitment, currentUser.daiAllowance]);

  useEffect(() => {
    console.log("LATEST TX: ", latestTransaction);
    const awaitTransaction = async (methodCall: TransactionTypes) => {
      setWaiting(true);
      await handleAndNotifyTxProcessing(toast, latestTransaction)
        .then(async (receipt) => {
          setWaiting(false);
          setLatestTransaction({ ...latestTransaction, pending: false });
          if (
            receipt.status === 1 &&
            methodCall === methodCallDepositAndCommit
          ) {
            navigation.navigate("Track");
          } else if (
            receipt?.status === 1 &&
            methodCall === methodCallApprove
          ) {
            if (spcContract.address) {
              refreshDaiAllowance();
            }
          }
        })
        .catch((err) => console.log(err));
    };

    if (
      latestTransaction.pending === true &&
      (latestTransaction.methodCall === methodCallDepositAndCommit ||
        latestTransaction.methodCall === methodCallApprove)
    ) {
      awaitTransaction(latestTransaction.methodCall);
    }
  }, [latestTransaction]);

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
            <CommitmentOverview />
            {sufficientAllowance ? undefined : (
              <FormControl display="flex" justifyContent="center">
                <FormLabel htmlFor="infinite-approval" pr="2">
                  Infinite approval
                </FormLabel>
                <Switch
                  id="infinite-approval"
                  defaultChecked={infinite}
                  onChange={() => setInfinite(!infinite)}
                />
              </FormControl>
            )}
          </VStack>
        )}
      </VStack>
      <Footer>
        <ButtonGroup>
          <Button onClick={() => navigation.goBack()}>
            {strings.footer.back}
          </Button>
          <CommitmentConfirmationButton
            sufficientAllowance={sufficientAllowance}
            infinite={infinite}
            waiting={waiting}
          />
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
