import React, { useState } from "react";
import {
  HStack,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Switch,
} from "@chakra-ui/react";
import { requestAllowance } from "../../utils/contractInteractions";
import { useCommitPool } from "../../contexts/commitPoolContext";
import { useContracts } from "../../contexts/contractContext";

const AllowanceButton = () => {
  const [infinite, setInfinite] = useState<boolean>(true);
  const { commitment } = useCommitPool();
  const { daiContract, spcContract } = useContracts();

  const buttonText = `Request ${
    infinite ? "infinite" : `${commitment?.stake} DAI`
  } allowance`;

  const onAllowanceRequest = () => {
    if (commitment?.stake && daiContract && spcContract) {
      infinite
        ? requestAllowance(-1, daiContract, spcContract.address)
        : requestAllowance(commitment.stake, daiContract, spcContract.address);
    }
  };

  return (
    <VStack>
      <Button onClick={() => onAllowanceRequest()}>{buttonText}</Button>
      <FormControl display="flex" justifyContent="center">
        <FormLabel htmlFor="infinite-allowance" pr="2">
          Infinite allowance
        </FormLabel>
        <Switch
          id="infinite-allowance"
          defaultChecked={infinite}
          onChange={() => setInfinite(!infinite)}
        />
      </FormControl>
    </VStack>
  );
};

export default AllowanceButton;
