import React from "react";
import { Button, useToast } from "@chakra-ui/react";
import { executeDepositAndCommit } from "../../utils/contractInteractions";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useStrava } from "../../contexts/stravaContext";
import { useContracts } from "../../contexts/contractContext";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { Transaction } from "ethers";
import { TransactionTypes } from "../../types";
import { validCommitmentRequest } from "../../utils/commitment";

const DepositAndCommitButton = () => {
  const toast = useToast();

  const { spcContract } = useContracts();
  const { commitment, activities } = useCommitPool();
  const { athlete } = useStrava();
  const { setLatestTransaction } = useCurrentUser();

  const onDepositAndCommit = async () => {
    const methodCall: TransactionTypes = "depositAndCommit";

    if (
      spcContract &&
      athlete &&
      commitment &&
      activities &&
      validCommitmentRequest(commitment, activities)
    ) {
      await executeDepositAndCommit(athlete, commitment, spcContract).then(
        (tx: Transaction) => {
          console.log("depositAndCommitTx: ", tx);
          setLatestTransaction({
            methodCall,
            tx,
            pending: true
          });
          return tx;
        }
      );
    } else {
      toast({
        title: "Cannot deposit and commit",
        description: "Please check your values and try again",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  return (
    <Button onClick={() => onDepositAndCommit()}>Deposit and Commit</Button>
  );
};

export default DepositAndCommitButton;
