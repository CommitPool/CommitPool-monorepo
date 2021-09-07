import { ethers } from 'ethers';

const wallet = (privateKey, provider) => {
    const _wallet = new ethers.Wallet(privateKey);
    console.log("returning wallet");

    return _wallet.connect(provider);
}

export default wallet;