import React, { useState } from "react";
import { Box, Text, VStack, Spacer, Button } from "@chakra-ui/react";

import {
  ActivitySelector,
  DistanceSelector,
  DateFromTo,
} from "../../components";

import strings from "../../resources/strings";
import StakeBox from "../stake-box/stake-box.component";
import { parseSecondTimestampToFullString } from "../../utils/dateTime";
import { useCommitPool } from "../../contexts/commitPoolContext";

const CommitmentOverview = () => {
  const [editMode, setEditMode] = useState<boolean>();
  const { commitment } = useCommitPool();
  return (
    <Box>
      {editMode ? (
        <VStack>
          <ActivitySelector
            text={strings.activityGoal.setUp.activitySelector}
          />
          <DistanceSelector
            text={strings.activityGoal.setUp.distanceSelector}
          />
          <DateFromTo />
          <StakeBox />
          <Button
            onClick={() => {
              setEditMode(false);
            }}
          >
            Set
          </Button>
        </VStack>
      ) : (
        <VStack>
          <Text>{strings.confirmation.commitment.text}</Text>
          <Box>
            <Text as="em">
              {`${
                strings.confirmation.commitment.activity
              } ${commitment?.activityName?.toLowerCase()} `}
              {`${strings.confirmation.commitment.distance} ${commitment?.goalValue} miles `}
              {`${
                strings.confirmation.commitment.startDate
              } ${parseSecondTimestampToFullString(commitment?.startTime)} `}
              {`${
                strings.confirmation.commitment.endDate
              } ${parseSecondTimestampToFullString(
                commitment?.endTime
              )} (end of day)`}
            </Text>
          </Box>
          <Spacer />
          <Text>{strings.confirmation.commitment.stake} </Text>
          <Text>{`${commitment?.stake} DAI`}</Text>
          <Button
            onClick={() => {
              setEditMode(true);
            }}
          >
            Edit
          </Button>
        </VStack>
      )}
    </Box>
  );
};

export default CommitmentOverview;
