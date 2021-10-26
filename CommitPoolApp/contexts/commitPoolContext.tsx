import React, { createContext, useContext, useEffect, useState } from "react";
import { Activity, Commitment, DropdownItem, User } from "../types";
import { useCurrentUser } from "./currentUserContext";
import { useContracts } from "./contractContext";
import {
  formatActivities,
  parseCommitmentFromContract,
  validActivityParameters,
} from "../utils/commitment";
import { Contract } from "ethers";

type CommitPoolContextType = {
  activities?: Activity[];
  commitment?: Partial<Commitment>;
  formattedActivities?: DropdownItem[];
  refreshCommitment: () => void;
  setCommitment: (commitment: Partial<Commitment>) => void;
};

export const CommitPoolContext = createContext<CommitPoolContextType>({
  activities: [],
  commitment: {},
  formattedActivities: [],
  refreshCommitment: () => {},
  setCommitment: (commitment: Partial<Commitment>) => {},
});

interface CommitPoolProps {
  children: any;
}

export const CommitPoolContextProvider: React.FC<CommitPoolProps> = ({
  children,
}: CommitPoolProps) => {
  const [activities, setActivities] = useState<Activity[]>();
  const [commitment, setCommitment] = useState<Partial<Commitment>>();
  const [formattedActivities, setFormattedActivities] =
    useState<DropdownItem[]>();
  const { currentUser } = useCurrentUser();
  const { spcContract } = useContracts();

  //Check for commitment when user is logged in
  useEffect(() => {
    if (!commitment && currentUser && spcContract && activities) {
      console.log(
        `Checking for commitment for account ${currentUser.attributes?.["custom:account_address"]}`
      );
      refreshCommitment();
    }
  }, [commitment, currentUser, spcContract, activities]);

  useEffect(() => {
    if (spcContract) {
      console.log("Getting activities from: ", spcContract);
      const buildActivityArray = async () => {
        const _activities: Activity[] = [];
        let loading: boolean = true;
        let index: number = 0;

        while (loading) {
          try {
            const key = await spcContract.activityKeyList(index);

            const activity = await spcContract.activities(key);

            if (activity.exists && activity.allowed) {
              console.log("Parsing activity: ", activity);
              const clone = Object.assign({}, activity);
              clone.key = key;
              clone.name = activity.name;
              _activities.push(clone as Activity);
            }
            index++;
          } catch (error) {
            loading = false;
          }
        }

        return _activities;
      };

      buildActivityArray()
        .then((array) => {
          setActivities(array);
        })
        .catch((e) => console.log("Error getting activities: ", e));
    }
  }, [spcContract]);

  //Format activities for dropdown after retrieving from contract
  useEffect(() => {
    if (activities && activities?.length > 0) {
      console.log("Formatting activities");
      const _formattedActivities: DropdownItem[] = formatActivities(activities);
      setFormattedActivities(_formattedActivities);
    }
  }, [activities]);

  //Check activity parameters
  useEffect(() => {
    if (activities && commitment) {
      if (
        validActivityParameters(commitment, activities) &&
        !commitment.activitySet
      ) {
        console.log("Setting activitySet to true");
        setCommitment({ ...commitment, activitySet: true });
      } else if (
        !validActivityParameters(commitment, activities) &&
        commitment.activitySet
      ) {
        console.log("Setting activitySet to true");
        setCommitment({ ...commitment, activitySet: false });
      }
    }
  }, [commitment]);

  const refreshCommitment = async () => {
    if (
      currentUser.attributes?.["custom:account_address"] &&
      spcContract &&
      activities
    ) {
      console.log("Getting commitment");
      const _address = currentUser.attributes["custom:account_address"];
      const commitment = await spcContract.commitments(_address);
      const _commitment: Partial<Commitment> = parseCommitmentFromContract(
        commitment,
        activities
      );
      console.log("Setting commitment: ", _commitment);
      setCommitment(_commitment);
    }
  };

  return (
    <CommitPoolContext.Provider
      value={{
        activities,
        commitment,
        formattedActivities,
        refreshCommitment,
        setCommitment,
      }}
    >
      {children}
    </CommitPoolContext.Provider>
  );
};

export const useCommitPool = () => {
  const {
    activities,
    commitment,
    formattedActivities,
    refreshCommitment,
    setCommitment,
  } = useContext(CommitPoolContext);
  return {
    activities,
    commitment,
    formattedActivities,
    refreshCommitment,
    setCommitment,
  };
};
