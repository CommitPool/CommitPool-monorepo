import { getCommitmentRequestParameters } from "./commitment";
import { BigNumber, Contract, ethers } from "ethers";
import { Athlete, Commitment, TransactionDetails, User } from "../types";
import usePlausible from "../hooks/usePlausible";
import { formatUnits, parseUnits } from "ethers/lib/utils";

export const getApproval = async (
  user: Partial<User>,
  spender: string,
  contract: Partial<Contract>
) => {
  if (user.attributes?.["custom:account_address"]) {
    return await contract
      .allowance(user.attributes["custom:account_address"], spender)
      .then((res: BigNumber) => {
        console.log(res.toString());
        return ethers.utils.formatEther(res).toString();
      });
  }
};

export const executeDepositAndCommit = async (
  athlete: Athlete,
  commitment: Partial<Commitment>,
  spcContract: Partial<Contract>
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
  contract: Partial<Contract>,
  spender: string
) => {
  return amount === -1
    ? await contract.approve(
        spender,
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
      )
    : await contract.approve(spender, parseUnits(amount.toString(), 18));
};

export const handleAndNotifyTxProcessing = async (
  toast: any,
  transaction: Partial<TransactionDetails>,
  successMessage = "Transaction succesful!",
  failMessage = "Transaction failed"
) => {
  try {
    const receipt = await transaction.tx.wait();

    if (receipt && receipt.status === 0) {
      toast({
        title: failMessage,
        description: "Please check your tx on Polygonscan and try again",
        status: "error",
        duration: 5000,
        isClosable: false,
        position: "top",
      });
    }

    if (receipt && receipt.status === 1) {
      toast({
        title: successMessage,
        description: "Let's continue",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }

    return receipt;
  } catch {
    console.log("Got error on latest Tx: ", transaction);
    toast({
      title: "Transaction failed",
      description: "Please check your tx on Polygonscan and try again",
      status: "error",
      duration: 5000,
      isClosable: false,
      position: "top",
    });
  }
};
