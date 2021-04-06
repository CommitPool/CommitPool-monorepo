import { ethers, utils } from "ethers";
import domains from "./domains.js";
import metatx from "./metatransactions.js";
import getEnvVars from "../../environment.js";

const { abi, daiAbi } = getEnvVars();

const showErrorMessage = (message) => {
  console.log("ERROR: ", message);
};
const showInfoMessage = (message) => {
  console.log("INFO: ", message);
};
const showSuccessMessage = (message) => {
  console.log("SUCCESS: ", message);
};

const transactionHelper = {
  getSignatureParameters: (signature) => {
    getSignatureParameters(signature);
  },
  signAndSendDaiApproval: async (web3provider, overrides) => {
    signAndSendDaiApproval(web3provider, overrides);
  },
  signAndSendDepositAndCommit: async (web3provider, commitment, _overrides) => {
    signAndSendDepositAndCommit(web3provider, commitment, _overrides);
  },
};

const getSignatureParameters = (signature) => {
  if (!utils.isHexString(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.')
    );
  }
  let expanded = utils.splitSignature(signature);
  return expanded;
};

const sendMetaTransaction = async (
  networkProvider,
  userAddress,
  contract,
  functionData,
  r,
  s,
  v,
  overrides
) => {
  try {
    let gasPrice = await networkProvider.getGasPrice();

    let gasLimit = await contract.estimateGas
      .executeMetaTransaction(userAddress, functionData, r, s, v)
      .then((limit) => (overrides.gasLimit = limit.toString()));

    let tx = await contract.executeMetaTransaction(
      userAddress,
      functionData,
      r,
      s,
      v,
      overrides
    );
    console.log("TX: ", tx);

    tx.on("transactionHash", function (hash) {
      console.log(`Transaction hash is ${hash}`);
      showInfoMessage(`Transaction sent by relayer with hash ${hash}`);
    }).once("confirmation", function (confirmationNumber, receipt) {
      console.log(receipt);
      setTxHash(receipt.transactionHash);
      showSuccessMessage("Transaction confirmed on chain");
    });
  } catch (error) {
    showErrorMessage(error);
  }
};

const signAndSendMetaTransaction = async (
  web3provider,
  contract,
  functionSignature,
  dataToSign,
  _overrides
) => {
  const { account, provider, torus } = web3provider;
  return await torus.provider.sendAsync(
    {
      jsonrpc: "2.0",
      id: 999999999999,
      method: "eth_signTypedData_v4",
      params: [account, dataToSign],
    },
    function (error, response) {
      console.info(`User signature is ${response.result}`);
      if (error || (response && response.error)) {
        showErrorMessage("Could not get user signature");
      } else if (response && response.result) {
        let { r, s, v } = getSignatureParameters(response.result);
        console.log(account);
        console.log(JSON.stringify(message));
        console.log(message);
        console.log(txHelper.getSignatureParameters(response.result));

        const recovered = recoverTypedSignature_v4({
          data: JSON.parse(dataToSign),
          sig: response.result,
        });
        console.log(`Recovered ${recovered}`);
        sendMetaTransaction(
          provider,
          account,
          contract,
          functionSignature,
          r,
          s,
          v,
          _overrides
        );
      }
    }
  );
};

const signAndSendDaiApproval = async (web3provider, overrides) => {
  const { account, contracts } = web3provider;

  const daiContract = contracts.dai;
  const daiInterface = new ethers.utils.Interface(daiAbi);

  const domainData = domains.dai.domainData;
  const domainType = domains.dai.methods.approve.type;
  const metaTransactionType = metatx.type;

  //spender, amount
  const nonce = await daiContract.getNonce(account);
  const functionSignature = daiInterface.encodeFunctionData("approve", [
    account,
    "10000000000000000000",
  ]);

  const message = {
    nonce: parseInt(nonce),
    from: account,
    functionSignature: functionSignature,
  };

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message: message,
  });

  showInfoMessage(`Domain data: ${domainData}`);

  return await signAndSendMetaTransaction(
    web3provider,
    daiContract,
    functionSignature,
    dataToSign,
    overrides
  );
};

const signAndSendDepositAndCommit = async (web3provider, commitment, _overrides) => {
  const { account, contracts } = web3provider;

  const spcContract = contracts.commitPool;

  console.log("SPC Contract in tx-helper: ", spcContract);
  console.log("Commitment to transmit: ", commitment)

  const spcInterface = new ethers.utils.Interface(abi);

  const domainData = domains.commitPool.domainData;
  const domainType = domains.commitPool.methods.depositAndCommit.type;
  const metaTransactionType = metatx.type;

  const nonce = await spcContract.provider.getTransactionCount(account);

  showInfoMessage(`Nonce: ${nonce}`)
  const functionSignature = spcInterface.encodeFunctionData("depositAndCommit", [
    commitment.activityKey,
    commitment.goalValue,
    commitment.startTime,
    commitment.endTime,
    commitment.stake,
    commitment.depositAmount,
    commitment.userId
  ])

  showInfoMessage(`Signature: ${functionSignature}`)

  const message = {
    nonce: parseInt(nonce),
    from: account,
    functionSignature: functionSignature,
  };

  showInfoMessage(`Message: ${message}`)

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message: message,
  });

  showInfoMessage(`Data to sign: ${dataToSign}`);

  return await signAndSendMetaTransaction(
    web3provider,
    spcContract,
    functionSignature,
    dataToSign,
    _overrides
  );
}


export default transactionHelper;
