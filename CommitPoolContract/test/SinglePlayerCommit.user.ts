import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, utils, BigNumber, BytesLike } from "ethers";
import { SinglePlayerCommit } from "../typechain/SinglePlayerCommit";

export function userCanManageCommitments(): void {
  context("User", function () {
    let owner: Signer;
    let user: Signer;
    let userAddress: string;
    let contractWithUser: SinglePlayerCommit;
    const currentDate = new Date();
    const startDate = Math.floor(currentDate.valueOf() / 1000);
    const endDate = Math.floor(addDays(currentDate, 7).valueOf() / 1000);
    const defaultParams = {
      activityKey: "",
      goal: 0,
      startTime: startDate,
      endTime: endDate,
      amountToDeposit: utils.parseEther("100.0"),
      amountToStake: utils.parseEther("50.0"),
      userId: "testUser",
    };
    const _overrides = {
      gasLimit: 1000000,
    };

    beforeEach(async function () {
      [owner, user] = await ethers.getSigners();
      contractWithUser = this.singlePlayerCommit.connect(user);
      userAddress = await user.getAddress();

      //Default commitment parameters
      defaultParams.activityKey = await contractWithUser.activityKeyList(0);
      defaultParams.goal = 50;
      defaultParams.startTime = startDate;
      defaultParams.endTime = endDate;
      defaultParams.amountToDeposit = utils.parseEther("100.0");
      defaultParams.amountToStake = utils.parseEther("50.0");
    });

    it("Can make one -and only one- commitment in a single call", async function () {
      //User balance in wallet [ETH] and contract [DAI]
      const _userBalance: BigNumber = await user.getBalance();
      const _userDaiBalanceInContract: BigNumber = await contractWithUser.committerBalances(userAddress);

      //Committer balance on contract
      const _committerBalance: BigNumber = await contractWithUser.totalCommitterBalance();

      const { amountToDeposit, activityKey, goal, startTime, endTime, amountToStake, userId } = defaultParams;
      await this.token.mock.transferFrom.returns(true);

      //Transaction
      await expect(
        contractWithUser.depositAndCommit(
          activityKey,
          goal,
          startTime,
          endTime,
          amountToStake,
          amountToDeposit,
          userId,
          _overrides,
        ),
      ).to.emit(contractWithUser, "NewCommitment");

      await expect(
        contractWithUser.depositAndCommit(
          activityKey,
          goal,
          startTime,
          endTime,
          amountToStake,
          amountToDeposit,
          userId,
          _overrides,
        ),
      ).to.be.revertedWith("SPC::noCommitment - msg.sender has an active commitment");

      //Validate
      const commitment = await contractWithUser.commitments(userAddress);
      const activityName = await contractWithUser.getActivityName(commitment.activityKey);
      const _updatedUserBalance: BigNumber = await user.getBalance();
      const _updatedUserDaiBalanceInContract: BigNumber = await contractWithUser.committerBalances(userAddress);
      const _updatedCommitterBalance: BigNumber = await contractWithUser.totalCommitterBalance();

      expect(_updatedUserBalance.lt(_userBalance)).to.be.true;
      expect(_updatedUserDaiBalanceInContract.lt(_userDaiBalanceInContract));
      expect(_updatedCommitterBalance.lt(_committerBalance));

      expect(commitment.committer).to.be.properAddress;
      expect(activityName).to.equal("biking");
      expect(commitment.goalValue.toNumber()).to.equal(goal);
      expect(commitment.stake).to.equal(amountToStake);
      expect(commitment.startTime.eq(startTime));
      expect(commitment.endTime.eq(endTime));
      expect(commitment.met).to.be.false;
      expect(commitment.exists).to.be.true;
      expect(commitment.userId).to.not.be.undefined; //TODO can be more specific?
    });

    it("cannot make a commitment without sufficient funds", async function () {
      //Transaction
      const { activityKey, goal, startTime, endTime, amountToStake, userId } = defaultParams;
      const _amountToDeposit: BigNumber = utils.parseEther("40.0");
      await expect(
        contractWithUser.depositAndCommit(
          activityKey,
          goal,
          startTime,
          endTime,
          amountToStake,
          _amountToDeposit,
          userId,
          _overrides,
        ),
      ).to.be.revertedWith("SPC::makeCommitment - insufficient token balance");
    });

    it("cannot make a commitment with invalid parameters", async function () {
      await this.token.mock.transferFrom.returns(true);
      //Default parameters
      let { activityKey, goal, startTime, endTime, amountToStake, amountToDeposit, userId } = defaultParams;

      //Random fault Activity key
      activityKey = "0xb16dfc4a050ca7e77c1c5f443dc473a2f03ac722e25f721ab6333875f44984f2";

      await expect(
        contractWithUser.depositAndCommit(
          activityKey,
          goal,
          startTime,
          endTime,
          amountToStake,
          amountToDeposit,
          userId,
          _overrides,
        ),
      ).to.be.revertedWith("SPC::makeCommitment - activity doesn't exist or isn't allowed");

      activityKey = defaultParams.activityKey;

      //Goal
      goal = 1;

      await expect(
        contractWithUser.depositAndCommit(
          activityKey,
          goal,
          startTime,
          endTime,
          amountToStake,
          amountToDeposit,
          userId,
          _overrides,
        ),
      ).to.be.revertedWith("SPC::makeCommitment - goal is too low");

      goal = 50;

      await this.token.mock.transfer.returns(true);
      // expect("transfer").to.be.calledOnContract(this.token);
    });

    it("slashes funds when resolving an unmet commitment", async function () {
      const _slashedBalance: BigNumber = await contractWithUser.slashedBalance();

      // Deposit funds in contract
      const { amountToDeposit, activityKey, goal, startTime, endTime, amountToStake, userId } = defaultParams;
      await this.token.mock.transferFrom.returns(true);

      //Transaction
      await expect(
        contractWithUser.depositAndCommit(
          activityKey,
          goal,
          startTime,
          endTime,
          amountToStake,
          amountToDeposit,
          userId,
          _overrides,
        ),
      ).to.emit(contractWithUser, "NewCommitment");

      //Transaction
      let commitment = await contractWithUser.commitments(userAddress);

      expect(commitment.met).to.be.false;
      expect(commitment.exists).to.be.true;

      await this.token.mock.balanceOf.withArgs(contractWithUser.address).returns(utils.parseEther("1000"));
      await expect(contractWithUser.processAndSettleUser(_overrides)).to.emit(contractWithUser, "FundsSlashed");

      commitment = await contractWithUser.commitments(userAddress);
      const _updatedUserBalance: BigNumber = await contractWithUser.committerBalances(userAddress);
      const _updatedSlashedBalance: BigNumber = await contractWithUser.slashedBalance();

      expect(commitment.met).to.be.false;
      expect(commitment.exists).to.be.false;
      expect(_updatedUserBalance.eq(amountToDeposit.sub(amountToStake)));
      expect(_updatedSlashedBalance.gt(_slashedBalance)).to.be.true;
    });

    //TODO Configure start/endtime and resolve commitment
    it.skip("can resolve a commitment after end date", async function () {
      let commitment = await contractWithUser.commitments(userAddress);

      expect(commitment.met).to.be.false;
      expect(commitment.exists).to.be.true;

      await expect(contractWithUser.processCommitmentUser(_overrides)).to.emit(contractWithUser, "CommitmentEnded");

      commitment = await contractWithUser.commitments(userAddress);

      expect(commitment.met).to.be.false;
      expect(commitment.exists).to.be.false;
    });

    it("cannot manage activity state", async function () {
      const { activityKey } = defaultParams;
      const randomAddress = "0xd115bffabbdd893a6f7cea402e7338643ced44a6";

      let activity = await contractWithUser.activities(activityKey);

      await expect(
        contractWithUser.updateActivityOracle(activityKey, utils.getAddress(randomAddress), _overrides),
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(contractWithUser.updateActivityAllowed(activityKey, false, _overrides)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      await expect(contractWithUser.disableActivity(activityKey, _overrides)).to.be.revertedWith(
        "Ownable: caller is not the owner",
      );

      let activityCheck = await contractWithUser.activities(activityKey);
      expect(activity).to.deep.equal(activityCheck);

    });

    //TODO Call expired commitment of other user and settle funds
  });
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
