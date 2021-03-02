##  CommitPool Single Player Smart Contract repository

[CommitPool](http://commitpool.com/) helps people meet their personal goals by holding themselves accountable. CommitPool users stake money to credibly commit to meeting their goals, and lose their stake when they don’t.

Our MVP focuses on a single goal type for individuals, hence the Single Player mode.

Current address:

**Rinkeby** [0x0e92528803F04A82e96Af5d43D5b9faEaF8F28D8](https://rinkeby.etherscan.io/address/0x0e92528803f04a82e96af5d43d5b9faeaf8f28d8)

## Getting started

Currently Ganache and Node 14 are not playing well together. To get started:

1. Use node 12 (using yarn is recommended)
2. ```yarn install```
3. ```yarn build```
4. ```yarn test``` (to verify the build)

Note: [Hardhat guide](https://hardhat.org/guides/vscode-tests.html) on running test in VSCode

#### Deploying to local node
Buidler

1. Use node 12 (using yarn is recommended)
2. ```yarn hardhat node```
3. In second terminal```yarn hardhat run --network localhost scripts/deploy.ts  ```

Buidler & Ganache

1. Use node 12 (using yarn is recommended)
2. Start Ganache on port 8545
3. In second terminal```yarn hardhat run --network localhost scripts/deploy.ts  ```

Truffle

1. Use node 12 (using yarn is recommended)
2. Start Ganache on port 8545
3. In terminal```truffle migrate```

#### Deploying to Matic
Deployment to the Mumbai Testnet is configured in ```./truffle-config.js```

1. ```npm install truffle -g```
2. Deploy to Mumbai testnet: ```truffle migrate --network matic_mumbai```
3. Find your contract based on the address reported by Truffle in the [Matic Explorer](https://explorer-mumbai.maticvigil.com/).

Quite note on deploying to Matic:
* Test deployment using Truffle against a runnning Ganache instance: ```truffle migrate```
* Configure Matic network in [MetaMask](https://docs.matic.network/docs/develop/metamask/config-matic/)
* Request funds at [faucet](https://faucet.matic.network/)
* Use this wallet's seed phrase in the .env file to pay the deployment

Interaction with the contract on Matic via Truffle:
1. ```truffle console --network matic```
2. ```compile```
3. ```var singlePlayerCommit = await SinglePlayerCommit.at('<ADDRESS FROM DEPLOYMENT>')```
4. To test: ```await contractTest.activityKeyList(0)```

#### Interacting with the contract using Buidler
After deploying to a local node
1. ```yarn buidler console --network localhost     ```
2. ```const CommitPool = await ethers.getContractFactory("SinglePlayerCommit")```
3. ```const commitPool = await CommitPool.attach("<<CONTRACT ADDRESS FROM DEPLOYMENT>>")```

Example for interacting:
```await commitPool.withdraw(1000)```
## Features
[Technical documentation](https://ipfs.io/ipfs/QmVrBwsQ67RE9CVzyQRvDucK4LrjgB7tkAserztyBDNfJi)
#### Creation of Commitment

A commitment consists of an ```activity```, a ```goalValue``` for given activity, a ```startTime```, and ```stake```. We will automagically set the ```endTime``` 7 days after the startdate.

#### Management of Activities

An activity consists of a ```name``` and the ```oracle``` address. Activities can be enabled by setting it to ```allowed```.

#### Execution of commitment settlement

The contract can be called to process the commitment based on the address of the committer. A check on time and completion determines whether the stake is returned to the committer.

## Architecture

![Architecture diagram of CommitPool](/documentation/architecture.png "Architecture diagram")

## Stack

This repository is a fork from [Paul Berg's Solidity Template](https://github.com/PaulRBerg/solidity-template)

## Get in touch

[commitpool.com](http://commitpool.com/)

<commitpool@gmail.com>

Subscribe to our [Substack](https://commit.substack.com/)
