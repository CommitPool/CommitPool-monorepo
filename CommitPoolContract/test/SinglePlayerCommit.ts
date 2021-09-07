//Setup
import { Signer } from "ethers";
import { ethers, waffle } from "hardhat";

//Artifacts
import SinglePlayerCommitArtifact from "../artifacts/contracts/SinglePlayerCommit.sol/SinglePlayerCommit.json";
import { Accounts, Signers } from "../types";
import { SinglePlayerCommit } from "../typechain/SinglePlayerCommit";
import daiArtifact from "./resources/DAI.json";
import chainLinkArtifact from "./resources/ChainLink.json";

//Test suites
import { shouldDeployWithInitialParameters } from "./SinglePlayerCommit.deploy";
import { userCanManageCommitments } from "./SinglePlayerCommit.user";
import { ownerCanManageContract } from "./SinglePlayerCommit.owner";

const { deployContract } = waffle;

// setTimeout(async function () {
describe("SinglePlayerCommit", function () {
  before(async function () {
    console.log("Setting up environment [provider, signers, mock contracts]");
    this.accounts = {} as Accounts;
    this.signers = {} as Signers;

    const signers: Signer[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.accounts.admin = await signers[0].getAddress();
    this.oracle = await waffle.deployMockContract(this.signers.admin, chainLinkArtifact);
    this.daiToken = await waffle.deployMockContract(this.signers.admin, daiArtifact);
    this.chainlinkToken = await waffle.deployMockContract(this.signers.admin, chainLinkArtifact);
  });

  describe("Unittest", function () {
    beforeEach(async function () {
      const supportedActivities: string[] = ["biking", "running"];

      console.log("Deploying SinglePlayerCommit with %s", supportedActivities);

      this.singlePlayerCommit = (await deployContract(this.signers.admin, SinglePlayerCommitArtifact, [
        supportedActivities,
        this.oracle.address,
        this.daiToken.address,
        this.chainlinkToken.address,
      ])) as SinglePlayerCommit;
      console.log("SinglePlayerCommit deployed to ", this.singlePlayerCommit.address);
    });

    shouldDeployWithInitialParameters();
    ownerCanManageContract();
    userCanManageCommitments();
  });
});
