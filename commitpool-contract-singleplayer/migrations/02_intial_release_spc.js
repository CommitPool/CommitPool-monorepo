require("dotenv").config();
const SinglePlayerCommit = artifacts.require("SinglePlayerCommit");

module.exports = function(deployer) {
  // Deploy the Migrations contract as our only task
  const activities = ["Ride", "Run"];
  const oracle = process.env.ORACLE_ADDRESS_MATIC;
  const token = process.env.TOKEN_ADDRESS_MATIC;
  deployer.deploy(SinglePlayerCommit, activities, oracle, token);
};