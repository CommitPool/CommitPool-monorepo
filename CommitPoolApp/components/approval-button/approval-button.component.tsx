import React, { useState } from "react";
import {
  HStack,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { requestApproval } from "../../utils/contractInteractions";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useContracts } from "../../contexts/contractContext";

const ApprovalButton = () => {
  const [infinite, setInfinite] = useState<boolean>(true);
  const { commitment } = useCommitPool();
  const { daiContract, spcContract } = useContracts();

  const buttonText = `Request ${
    infinite ? "infinite" : `${commitment?.stake} DAI`
  } approval`;

  const onApprovalRequest = () => {
    if (commitment?.stake && daiContract && spcContract) {
      infinite
        ? requestApproval(-1, daiContract, spcContract.address)
        : requestApproval(commitment.stake, daiContract, spcContract.address);
    }
  };

  return (
    <VStack>
      <Button onClick={() => onApprovalRequest()}>{buttonText}</Button>
      <FormControl display="flex" justifyContent="center">
        <FormLabel htmlFor="infinite-approval" pr="2">
          Infinite allowance
        </FormLabel>
        <Switch
          id="infinite-approval"
          defaultChecked={infinite}
          onChange={() => setInfinite(!infinite)}
        />
      </FormControl>
    </VStack>
  );
};

export default ApprovalButton;
