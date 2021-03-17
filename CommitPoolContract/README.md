##  CommitPool Single Player Smart Contract repository

[CommitPool](http://commitpool.com/) helps people meet their personal goals by holding themselves accountable. CommitPool users stake money to credibly commit to meeting their goals, and lose their stake when they don’t.

Our MVP focuses on a single goal type for individuals, hence the Single Player mode.

Current address:

**Rinkeby** [0x24A2D8772521A9fa2f85d7024e020e7821C23c97](https://rinkeby.etherscan.io/address/0x964c44f85AF3fc4771e6f47A524c4e2501F03552)

**Matic Mumbai** [0xDB70351459190c00bB5ed98C3C423Cbc35f2A828](https://explorer-mumbai.maticvigil.com/address/0xDB70351459190c00bB5ed98C3C423Cbc35f2A828/transactions)
## Getting started

Currently Ganache and Node 14 are not playing well together. To get started:

1. Use node 12 (using yarn is recommended)
2. ```yarn install```
3. ```yarn build```
4. ```yarn test``` (to verify the build)

Note: [Hardhat guide](https://hardhat.org/guides/vscode-tests.html) on running test in VSCode

#### Deploying to local node
Hardhat

1. Use node 12 (using yarn is recommended)
2. ```yarn hardhat node```
3. In second terminal```yarn hardhat run --network localhost scripts/deploy.ts  ```

Hardhat & Ganache

1. Use node 12 (using yarn is recommended)
2. Start Ganache on port 8545
3. In second terminal```yarn hardhat run --network localhost scripts/deploy.ts  ```

### Contract deployment
```yarn hardhat run --network [NETWORK NAME DECLARED IN CONFIG] scripts/deploy.ts  ```

### Contract verification

``` yarn hardhat --network rinkeby verify --constructor-args scripts/arguments.js 0x24A2D8772521A9fa2f85d7024e020e7821C23c97 ```

#### Interacting with the contract using Hardhat
After deploying to a local node
1. ```yarn hardhat console --network localhost     ```
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
