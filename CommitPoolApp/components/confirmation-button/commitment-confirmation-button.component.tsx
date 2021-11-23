import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useCurrentUser } from "../../contexts/currentUserContext";
import { useCommitPool } from "../../contexts/commitPoolContext";
import AllowanceButton from "../allowance-button/allowance-button.component";
import DepositAndCommitButton from "../deposit-and-commit-button.component/deposit-and-commit-button.component";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
const CommitmentConfirmationButton = () => {
  const [sufficientAllowance, setSufficientAllowance] = useState<boolean>();
  const { currentUser } = useCurrentUser();
  const { commitment } = useCommitPool();
  const { daiAllowance } = currentUser;

  useEffect(() => {
    if (commitment?.stake && daiAllowance) {
      const stake = parseEther(commitment.stake.toString());
      const allowance = parseEther(daiAllowance.toString());

      stake.lt(allowance)
        ? setSufficientAllowance(false)
        : setSufficientAllowance(true);
    }
  }, [commitment, daiAllowance]);

  return (
    <Box>
      {sufficientAllowance ? <AllowanceButton /> : <DepositAndCommitButton />}
    </Box>
  );
};

export default CommitmentConfirmationButton;
