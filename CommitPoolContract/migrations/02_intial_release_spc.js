require("dotenv").config();
const SinglePlayerCommit = artifacts.require("SinglePlayerCommit");

module.exports = function(deployer) {
  // Deploy the Migrations contract as our only task
  if (!process.env.ORACLE_ADDRESS_MUMBAI || !process.env.DAI_TOKEN_ADDRESS_MUMBAI || !process.env.LINK_TOKEN_ADDRESS_MUMBAI) {
    console.log("Please set your oracle and token address(es) in a .env file");
    process.exit(1);
  }
  
  const activities = ["Ride", "Run"];
  const oracle = process.env.ORACLE_ADDRESS_MUMBAI;
  const daiToken = process.env.DAI_TOKEN_ADDRESS_MUMBAI;
  const linkToken = process.env.LINK_TOKEN_ADDRESS_MUMBAI;
  deployer.deploy(SinglePlayerCommit, activities, oracle, daiToken, linkToken);
};