import React from "react";
import { Box, Button } from "@chakra-ui/react";
import ApprovalButton from "../approval-button/approval-button.component";
import DepositAndCommitButton from "../deposit-and-commit-button.component/deposit-and-commit-button.component";

interface CommitmentConfirmationButton {
  sufficientAllowance: boolean;
  infinite: boolean;
  waiting: boolean;
}

const CommitmentConfirmationButton = ({
  sufficientAllowance,
  infinite,
  waiting,
}: CommitmentConfirmationButton) => {
  return (
    <Box>
      {waiting ? (
        <Button isLoading loadingText="Awaiting transaction"></Button>
      ) : sufficientAllowance ? (
        <DepositAndCommitButton />
      ) : (
        <ApprovalButton infinite={infinite} />
      )}
    </Box>
  );
};

export default CommitmentConfirmationButton;
