// We require the Buidler Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
// When running the script with `buidler run <script>` you'll find the Buidler
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";

async function main(): Promise<void> {
  // Buidler always runs the compile task when running scripts through it.
  // If this runs in a standalone fashion you may want to call compile manually
  // to make sure everything is compiled
  // await run("compile");

  // We get the contract to deploy
  if (!process.env.ORACLE_ADDRESS_MUMBAI || !process.env.DAI_TOKEN_ADDRESS_MUMBAI || !process.env.LINK_TOKEN_ADDRESS_MUMBAI) {
    console.log("Please set your oracle and token address(es) in a .env file");
    process.exit(1);
  }
  const activities: string[] = ["Ride", "Run"];
  const oracle ="0xFe620910d11E613922Bc3891EE25c6e9362Ac5ab";
  const daiToken: string = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
  const linkToken: string = "0x01BE23585060835E02B77ef475b0Cc51aA1e0709";
  const SinglePlayerCommit: ContractFactory = await ethers.getContractFactory("SinglePlayerCommit");
  const singlePlayerCommit: Contract = await SinglePlayerCommit.deploy(activities, oracle, daiToken, linkToken);
  await singlePlayerCommit.deployed();

  console.log("SinglePlayerCommit deployed to: ", singlePlayerCommit.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
