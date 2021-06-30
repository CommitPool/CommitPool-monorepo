import { log, dataSource, BigInt } from "@graphprotocol/graph-ts"
import {
    NewCommitment,
    CommitmentEnded,
    Deposit as DepositMade,
    Withdrawal as WithdrawalMade,
    ChainlinkRequested,
    RequestActivityDistanceFulfilled,
    ActivityUpdated,
  } from "../generated/SinglePlayerCommit/SinglePlayerCommit"
  import { Committer, Commitment, Deposit, Withdrawal, Activity, ActivityUpdate, OracleRequest } from "../generated/schema"
  import { SinglePlayerCommit } from "../generated/SinglePlayerCommit/SinglePlayerCommit"

  export function handleActivityUpdated(event: ActivityUpdated): void {

    let update = new ActivityUpdate(event.transaction.hash.toHexString() + "-" + event.logIndex.toHexString())

    let oracle = event.params.oracle

    let activity = Activity.load(event.params.name)
    if (activity == null) {
        activity = new Activity(event.params.name)
        activity.contractKey = event.params.activityKey
        activity.status = "allowed"
        activity.oracle = oracle

        update.newStatus = "allowed"
      }

    update.activity = activity.id
    
    if (oracle != activity.oracle) {
        update.newOracle = oracle
        activity.oracle = oracle
    }

    let allowed = event.params.allowed
    let exists = event.params.exists
    
    if (allowed && activity.status == "disallowed") {
        update.newStatus = "allowed"
        activity.status = "allowed"
    } else if (!allowed && activity.status == "allowed") {
        update.newStatus = "disallowed"
        activity.status = "disallowed"
    } else if (!exists && activity.status != "deleted") {
        update.newStatus = "deleted"
        activity.status = "deleted"
    }

    update.updatedAt = event.block.timestamp
    update.updateTxHash = event.transaction.hash

    update.save()
    activity.save()
  }

  export function handleDeposit(event: DepositMade): void {
    let committerId = event.params.committer.toHexString()
    let committer = Committer.load(committerId)
    if (committer == null) {
      committer = new Committer(committerId)
      committer.balance = BigInt.fromString("0")
      committer.nCommitmentsMade = 0
      committer.nCommitmentsMet = 0
      committer.nCommitmentsFailed = 0
    }

    let amount = event.params.amount

    committer.balance = committer.balance.plus(amount)

    let deposit = new Deposit(event.transaction.hash.toHexString() + "-" + event.logIndex.toString())

    deposit.amount = amount
    deposit.committer = committerId
    deposit.depositedAt = event.block.timestamp
    deposit.depositTxHash = event.transaction.hash

    committer.save()
    deposit.save()
  }
  
  export function handleNewCommitment(event: NewCommitment): void {

    log.debug("starting handleNewCommitment...{}", ["this is where it begins"])
  
    let committerId = event.params.committer.toHexString()

    log.debug("committerId: {}", [committerId])
    let committer = Committer.load(committerId)
    if (committer == null) {
      committer = new Committer(committerId)
      committer.balance = BigInt.fromString("0")
      committer.nCommitmentsMade = 0
      committer.nCommitmentsMet = 0
      committer.nCommitmentsFailed = 0
    }

    log.debug("committer created: {}", [committer.id])
    
    let nCommitments = committer.nCommitmentsMade
    let nCString = nCommitments.toString()

    let commitment = new Commitment(committerId + "-" + nCString)

    committer.nCommitmentsMade ++

    commitment.committer = committer.id

    commitment.activity = event.params.activityName
    commitment.goalValue = event.params.endTime
    commitment.startTime = event.params.startTime
    commitment.endTime = event.params.endTime
    commitment.stake = event.params.stake
    commitment.status = "open"
    commitment.createdAt = event.block.timestamp
    commitment.commitmentTxHash = event.transaction.hash
    commitment.network = dataSource.network()
    commitment.contract = event.address
   
    commitment.save()
    committer.save()
  }

  export function handleChainlinkRequested( event: ChainlinkRequested): void {
    let requestId = event.params.id
    let request = new OracleRequest(requestId.toHexString())

    let contract = SinglePlayerCommit.bind(event.address)
    let committerId = contract.jobAddresses(requestId).toHexString()

    let committer = Committer.load(committerId)

    let nCommitments = committer.nCommitmentsMade
    let nCString = nCommitments.toString()

    request.commitment = committerId + "-" + nCString
    request.requestedAt = event.block.timestamp
    request.requestTxHash = event.transaction.hash

    request.save()
  }

  export function handlehandleRequestActivityDistanceFulfilled(event: RequestActivityDistanceFulfilled): void {

    let request = OracleRequest.load(event.params.requestId.toHexString())

    let response = event.params.distance
    request.response = response
    request.respondedAt = event.block.timestamp
    request.responseTxHash = event.transaction.hash

    let commitment = Commitment.load(request.commitment)

    commitment.reportedValue = response

    commitment.save()
    request.save()
  }

  export function handleCommitmentEnded(event: CommitmentEnded): void {
    let committerId = event.params.committer.toHexString()
    let committer = Committer.load(committerId)

    let nCommitments = committer.nCommitmentsMade
    let nCString = nCommitments.toString()
    let commitment = Commitment.load(committerId + "-" + nCString)

    let met = event.params.met
    if (met) {
        commitment.status = "succeeded"
        committer.nCommitmentsMet ++
    } else {
        commitment.status = "failed"
        committer.nCommitmentsFailed ++
        let penalty = event.params.amountPenalized
        commitment.penalty = penalty
        committer.cumPenalties = committer.cumPenalties.plus(penalty)
        committer.balance = committer.balance.minus(penalty)
    }
    commitment.processedAt = event.block.timestamp
    commitment.processTxHash = event.transaction.hash

    commitment.save()
    committer.save()
  }

  export function handleWithdrawal(event: WithdrawalMade): void {
    let committerId = event.params.committer.toHexString()
    let committer = Committer.load(committerId)
    if (committer == null) {
      committer = new Committer(committerId)
    }

    let amount = event.params.amount

    committer.balance = committer.balance.minus(amount)

    let withdrawal = new Withdrawal(event.transaction.hash.toHexString() + "-" + event.logIndex.toHexString())

    withdrawal.amount = amount
    withdrawal.committer = committerId
    withdrawal.withdrawnAt = event.block.timestamp
    withdrawal.withdrawalTxHash = event.transaction.hash

    committer.save()
    withdrawal.save()
  }

  