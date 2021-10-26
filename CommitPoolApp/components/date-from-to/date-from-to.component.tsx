import React, { useEffect, useState } from "react";

import {
  Box,
  Divider,
  Text,
  HStack,
  Input,
  NumberInputField,
  NumberInput,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  VStack
} from "@chakra-ui/react";

import { DateTime } from "luxon";

import { parseSecondTimestampToFullString } from "../../utils/dateTime";
import { useCommitPool } from "../../contexts/commitPoolContext";

interface DateFromTo {
  children?: React.ReactNode;
}

const DateFromTo = ({ children }: DateFromTo) => {
  const [startIn, setStartIn] = useState<string>("0");
  const [endIn, setEndIn] = useState<string>("7");

  const { commitment, setCommitment } = useCommitPool();

  useEffect(() => {
    const updateDates = () => {
      const [startTime, endTime] = calculateStartAndEnd(startIn, endIn);
      console.log("Setting commitment: ", {
        ...commitment,
        startTime,
        endTime,
      });
      setCommitment({ ...commitment, startTime, endTime });
    };

    updateDates();
  }, [startIn, endIn]);

  const calculateStartAndEnd = (
    _start: string,
    _end: string
  ): [number, number] => {
    const start: number = Number(_start);
    const end: number = Number(_end);
    let startTimestamp: number;
    let endTimestamp: number;
    if (start === 0) {
      startTimestamp = DateTime.now().toSeconds();
      endTimestamp = DateTime.now()
        .plus({ days: Number(_end) })
        .startOf("day")
        .toSeconds();
    } else if (start > 0) {
      startTimestamp = DateTime.now()
        .plus({ days: start })
        .startOf("day")
        .toSeconds();
      endTimestamp = DateTime.fromSeconds(startTimestamp)
        .plus({ days: end })
        .endOf("day")
        .toSeconds();
    } else if (commitment?.startTime && commitment?.endTime) {
      startTimestamp = commitment.startTime;
      endTimestamp = commitment.endTime;
    } else {
      startTimestamp = DateTime.now().toSeconds();
      endTimestamp = DateTime.fromSeconds(startTimestamp)
        .plus({ days: 7 })
        .set({ hour: 23, minute: 59 })
        .toSeconds();
    }

    return [startTimestamp, endTimestamp];
  };

  return (
    <Box>
      <HStack>
        <Text>Starting in</Text>
        <NumberInput
          w="75px"
          size="sm"
          defaultValue={startIn}
          min={0}
          onChange={(value) => setStartIn(value)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Text> days for </Text>
        <NumberInput
          w="75px"
          size="sm"
          defaultValue={endIn}
          min={0}
          onChange={(value) => setEndIn(value)}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Text>days</Text>
      </HStack>
      <Divider mt="2em" mb="2em"/>
      <VStack>
        <Text as="em">{`Starts on ${parseSecondTimestampToFullString(
          commitment?.startTime
        )} `}</Text>
        <Text as="em">{`Ends on  ${parseSecondTimestampToFullString(
          commitment?.endTime
        )} (end of day)`}</Text>
      </VStack>
    </Box>
  );
};

export default DateFromTo;
