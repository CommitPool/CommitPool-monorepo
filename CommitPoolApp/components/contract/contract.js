import { ethers } from 'ethers';

const contract = (address, abi, provider) => {
    console.log("returning contract");
    return new ethers.Contract(address, abi, provider);
}
export default contract;
