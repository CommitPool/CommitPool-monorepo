import React from "react";
import { HStack, Text } from "@chakra-ui/react";

interface CustomProgressBar {
  size: number;
}

const CustomProgressBar = ({ size }: CustomProgressBar) => {
  const steps = [
    "Activity & Goal",
    "Set Stake",
    "Connect Data Source",
    "Deposit Funds",
    "Review & Commit",
    "Commited!",
  ];
  return (
    <HStack
      backgroundColor="rgba(0,0,0,0.4)"
      backdropFilter="blur(27px)"
      w="100%"
      justify="flex-start"
      borderRadius="10"
    >
      {steps.map((item, index) => {
        return (
          <Text
            key={index}
            as={size === index + 1 ? "u" : undefined}
            align="center"
            fontSize="sm"
            p={2}
          >
            {item}
          </Text>
        );
      })}
    </HStack>
  );
};

export default CustomProgressBar;
