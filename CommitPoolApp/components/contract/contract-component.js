
import { ethers } from 'ethers';
import Provider from '../provider/provider-component';

export default async (address, abi) => {
    return await Provider().then(provider => {
        console.log(provider)
        return new ethers.Contract(address, abi, provider);
     });
}