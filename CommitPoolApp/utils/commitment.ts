import { ethers } from "ethers";
import { Activity, Commitment, DropdownItem } from "../types";

const getActivityName = (
  activityKey: string,
  activities: Activity[]
): string => {
  const activity = activities.find((activity) => activity.key === activityKey);
  return activity?.name || "";
};

const formatActivities = (activities: Activity[]): DropdownItem[] => {
  const formattedActivities = activities.map((act: Activity) => {
    if (act.name === "Run") {
      return {
        label: "Run 🏃‍♂️",
        value: act.key,
      };
    } else if (act.name === "Ride") {
      return {
        label: "Ride 🚲",
        value: act.key,
      };
    } else if (act.name === "Walk") {
      return {
        label: "Walk 🚶🏻",
        value: act.key,
      };
    } else {
      return {
        label: act.name,
        value: act.key,
      };
    }
  });

  return formattedActivities;
};

const parseCommitmentFromContract = (
  commitment: any,
  activities: Activity[]
): Partial<Commitment> => {
  const activityName: string = getActivityName(
    commitment.activityKey,
    activities
  );

  const goalValue = Number.parseFloat(commitment.goalValue) / 100;
  const reportedValue = Number.parseFloat(commitment.reportedValue) / 100;
  const progress = (reportedValue / goalValue) * 100;

  const _commitment: Partial<Commitment> = {
    activityKey: commitment.activityKey,
    goalValue,
    reportedValue,
    endTime: Number.parseFloat(commitment.endTime.toString()),
    startTime: Number.parseFloat(commitment.startTime.toString()),
    stake: ethers.utils.formatEther(commitment.stake),
    exists: commitment.exists,
    met: commitment.met,
    unit: "mi",
    activityName,
    activitySet: true,
    stakeSet: true,
    progress
  };

  return _commitment;
};

const validCommitmentRequest = (
  commitment: Partial<Commitment>,
  activities: Activity[]
): boolean => {
  return (
    validActivityParameters(commitment, activities) && validStake(commitment)
  );
};

const validActivityParameters = (
  commitment: Partial<Commitment>,
  activities: Activity[]
): boolean => {
  return (
    validActivityKey(commitment, activities) &&
    validStartEndTimestamps(commitment) &&
    validGoalValue(commitment)
  );
};

const validActivityKey = (
  commitment: Partial<Commitment>,
  activities: Activity[]
): boolean => {
  if (commitment?.activityKey) {
    return (
      activities.find((activity) => activity.key === commitment.activityKey) !==
      undefined
    );
  }

  return false;
};

const validStartEndTimestamps = (commitment: Partial<Commitment>): boolean => {
  const nowInSeconds = new Date().getTime() / 1000;

  if (commitment.endTime && commitment.startTime) {
    return (
      commitment.endTime > commitment.startTime &&
      commitment.endTime > nowInSeconds
    );
  }

  return false;
};

const validGoalValue = (commitment: Partial<Commitment>): boolean => {
  if (commitment.goalValue) {
    return commitment.goalValue > 0;
  }

  return false;
};

const validStake = (commitment: Partial<Commitment>): boolean => {
  if (commitment.stake) {
    return commitment.stake > 0;
  }

  return false;
};

const getCommitmentRequestParameters = (commitment: Partial<Commitment>) => {
  const _activityKey: string | undefined = commitment?.activityKey;
  const _goalValue: number | undefined = commitment?.goalValue
    ? Math.floor(commitment.goalValue) * 100
    : undefined;
  const _startTime: number | undefined = commitment?.startTime
    ? Math.ceil(commitment.startTime)
    : undefined;
  const _endTime: number | undefined = commitment?.endTime
    ? Math.ceil(commitment.endTime)
    : undefined;
  const _stake: string | undefined = commitment?.stake
    ? ethers.utils.parseEther(commitment.stake.toString()).toString()
    : undefined;
  const _depositAmount = _stake;
  return {
    _activityKey,
    _goalValue,
    _startTime,
    _endTime,
    _stake,
    _depositAmount,
  };
};

export {
  formatActivities,
  getActivityName,
  getCommitmentRequestParameters,
  parseCommitmentFromContract,
  validCommitmentRequest,
  validActivityParameters,
};
