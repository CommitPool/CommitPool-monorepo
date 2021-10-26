import React from "react";
import { Text, HStack, Select } from "@chakra-ui/react";

import { useCommitPool } from "../../contexts/commitPoolContext";

interface ActivitySelectorProps {
  text: string;
}

const ActivitySelector = ({ text }: ActivitySelectorProps) => {
  const { formattedActivities, commitment, setCommitment } = useCommitPool();

  const onSelect = (activityKey: string) => {
    console.log("Setting commitment: ", { ...commitment, activityKey });
    setCommitment({ ...commitment, activityKey });
  };

  return (
    <HStack>
      <Text>{text}</Text>
      <Select
        placeholder="Select activity"
        onChange={(event) => onSelect(event.target.value)}
      >
        {formattedActivities?.map((activity) => (
          <option value={activity.value} key={activity.value}>{activity.label}</option>
        ))}
      </Select>
    </HStack>
  );
};

export default ActivitySelector;
