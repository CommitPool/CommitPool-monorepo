//TODO refactor methods away from pages
import { getCommitmentRequestParameters } from "./commitment";
import { Contract } from "ethers";
import { Athlete, Commitment, User } from "../types";
import usePlausible from "../hooks/usePlausible";

export const getApproval = async (
  user: User,
  spender: string,
  contract: Contract
) => {
  return await contract
    .allowance(user.attributes["custom:account_address"], spender)
    .toString();
};

export const executeDepositAndCommit = async (
  athlete: Athlete,
  commitment: Partial<Commitment>,
  spcContract: Contract
) => {
  const { trackEvent } = usePlausible();
  
  trackEvent("spc_create_commitment");
  const _commitmentParameters = getCommitmentRequestParameters(commitment);
  const _commitmentParametersWithUserId = {
    ..._commitmentParameters,
    _userId: String(athlete.id),
  };

  console.log(
    "Commitment request with user ID: ",
    _commitmentParametersWithUserId
  );

  return await spcContract.depositAndCommit(
    _commitmentParametersWithUserId._activityKey,
    _commitmentParametersWithUserId._goalValue,
    _commitmentParametersWithUserId._startTime,
    _commitmentParametersWithUserId._endTime,
    _commitmentParametersWithUserId._stake,
    _commitmentParametersWithUserId._depositAmount,
    _commitmentParametersWithUserId._userId,
    { gasLimit: 5000000 }
  );
};

export const requestApproval = async (
  amount: number,
  contract: Contract,
  spender: string
) => {
  return amount === -1
    ? await contract.approve(
        spender,
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    : await contract.approve(spender, amount);
};
