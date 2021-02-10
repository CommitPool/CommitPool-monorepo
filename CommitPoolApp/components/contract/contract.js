import { ethers } from 'ethers';
import getProvider from '../provider/provider';

const contract = (address, abi) => {
    const provider = getProvider();
    console.log(provider);
    console.log("returning contract");

    return new ethers.Contract(address, abi, provider);
}
export default contract;
