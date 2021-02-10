import { ethers } from 'ethers';
import getProvider from '../provider/provider';

const wallet = (privateKey) => {
    const provider = getProvider();
    const _wallet = new ethers.Wallet(privateKey);
    console.log("returning wallet");

    return _wallet.connect(provider);
}

export default wallet;