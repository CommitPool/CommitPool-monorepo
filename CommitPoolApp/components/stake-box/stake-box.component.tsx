import React from "react";

import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  useToast,
  NumberInputField,
  NumberInput,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useCommitPool } from "../../contexts/commitPoolContext";

const StakeBox = () => {
  const toast = useToast();
  const toastId = "invalid_stake";
  const { commitment, setCommitment } = useCommitPool();

  const onStakeInput = (stake: string) => {
    const _stake = Number.parseFloat(stake);
    if (!isNaN(_stake) && validStake(_stake)) {
      setCommitment({
        ...commitment,
        stake: _stake.toString(),
        stakeSet: true,
      });
    } else {
      setCommitment({ ...commitment, stake: undefined, stakeSet: false });
      if (!toast.isActive(toastId)) {
        toast({
          id: toastId,
          title: "Incorrect stake amount",
          description: "Please double check your stake amount",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
      }
    }

    if (!isNaN(_stake) && _stake >= 100) {
      toast({
        title: "High stakes",
        description: "You're staking a high amount. Are you sure?",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Box>
      <HStack spacing={6}>
        <Heading size="md">Your stake amount</Heading>
        <HStack>
          <NumberInput
            maxW="100px"
            size="sm"
            defaultValue={commitment?.stake || 0}
            min={0}
            onChange={(value) => onStakeInput(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Text>DAI</Text>
        </HStack>
      </HStack>
    </Box>
  );
};

const validStake = (stake: number) => {
  return stake > 0;
};

export default StakeBox;
