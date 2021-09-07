import { ethers, utils } from "ethers";

const contract = (address, abi, provider) => {
  if (isAddress(address)) {
    return new ethers.Contract(address, abi, provider);
  }
  return {};
};

function isAddress(address) {
  try {
    utils.getAddress(address);
  } catch (e) {
    return false;
  }
  return true;
}

export default contract;
