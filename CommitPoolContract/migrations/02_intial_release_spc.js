require("dotenv").config();
const SinglePlayerCommit = artifacts.require("SinglePlayerCommit");

module.exports = function(deployer) {
  // Deploy the Migrations contract as our only task
  const activities = ["Ride", "Run"];
  const oracle = process.env.ORACLE_ADDRESS_MUMBAI;
  const daiToken = process.env.DAI_TOKEN_ADDRESS_MUMBAI;
  const linkToken = process.env.LINK_TOKEN_ADDRESS_MUMBAI;
  deployer.deploy(SinglePlayerCommit, activities, oracle, daiToken, linkToken);
};