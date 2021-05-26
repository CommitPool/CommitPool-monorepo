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
  const oracle ="0x1af43B0C2DdC416b375ab97CeF10c73DfF5D27d8";
  const daiToken: string = "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";
  const linkToken: string = "0x326C977E6efc84E512bB9C30f76E30c160eD06FB";
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
