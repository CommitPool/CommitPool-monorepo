import React from "react";

import {
  Box,
  Text,
  HStack,
  Input,
  NumberInputField,
  NumberInput,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useCommitPool } from "../../contexts/commitPoolContext";

interface DistanceSelector {
  text: string;
}

const DistanceSelector = ({ text }: DistanceSelector) => {
  const { commitment, setCommitment } = useCommitPool();

  const onDistanceInput = (value: string) => {
    const distance: number = Number.parseFloat(value);
    if (!isNaN(distance) && distance > 0) {
      console.log("Setting commitment: ", {
        ...commitment,
        goalValue: distance,
      });
      setCommitment({ ...commitment, goalValue: distance });
    }
  };

  return (
    <HStack>
      <Text>{text}</Text>
      <NumberInput
        maxW="100px"
        size="sm"
        defaultValue={commitment?.goalValue || 0}
        min={0}
        onChange={(value) => onDistanceInput(value)}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Text>miles</Text>
    </HStack>
  );
};

export default DistanceSelector;
