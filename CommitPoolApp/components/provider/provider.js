import { ethers } from "ethers";
import getEnvVars from '../../environment.js';


const provider = () => {
  const { rpcUrl } = getEnvVars();
  console.log("returning provider");

  return new ethers.providers.JsonRpcProvider(rpcUrl);
};

export default provider;
