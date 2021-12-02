import React from "react";
import { VStack, Button } from "@chakra-ui/react";
import { requestApproval } from "../../utils/contractInteractions";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useContracts } from "../../contexts/contractContext";
import { TransactionTypes } from "../../types";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { Transaction } from "ethers";

interface ApprovalButton {
  infinite: boolean;
}

const ApprovalButton = ({ infinite }: ApprovalButton) => {
  const methodCall: TransactionTypes = "approve";

  const { commitment } = useCommitPool();
  const { daiContract, spcContract } = useContracts();
  const { setLatestTransaction } = useCurrentUser();

  const buttonText = `Request ${
    infinite ? "infinite" : `${commitment?.stake} DAI`
  } approval`;

  const onApprovalRequest = () => {
    if (commitment?.stake && daiContract && spcContract?.address) {
      const tx = infinite
        ? requestApproval(-1, daiContract, spcContract.address)
        : requestApproval(Number(commitment.stake), daiContract, spcContract.address);

      tx.then((tx: Transaction) => {
        console.log("approveTx: ", tx);
        setLatestTransaction({
          methodCall,
          tx,
          pending: true,
        });
        return tx;
      });
    }
  };

  return (
    <VStack>
      <Button onClick={() => onApprovalRequest()}>{buttonText}</Button>
    </VStack>
  );
};

export default ApprovalButton;
