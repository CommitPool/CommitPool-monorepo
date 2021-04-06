import getEnvVars from "../../environment.js";

const { commitPoolContractAddress, daiContractAddress } = getEnvVars();

const domains = { dai: {}, commitPool: {} };

domains.dai = {
  domainData: {
    name: "(PoS) Dai Stablecoin",
    version: "1",
    verifyingContract: daiContractAddress,
    salt: "0x" + (80001).toString(16).padStart(64, "0"),
  },
  methods: { approve: {} },
};

domains.dai.methods.approve = {
  name: "approve",
  type: [
    {
      name: "name",
      type: "string",
    },
    {
      name: "version",
      type: "string",
    },
    {
      name: "verifyingContract",
      type: "address",
    },
    {
      name: "salt",
      type: "bytes32",
    },
  ],
};

domains.commitPool = {
  domainData: {
    name: "SinglePlayerCommit",
    version: "1",
    verifyingContract: commitPoolContractAddress,
    salt: "0x" + (80001).toString(16).padStart(64, "0"),
  },
  methods: { depositAndCommit: {} }, 
}

domains.commitPool.methods.depositAndCommit = {
  name: "depositAndCommit",
  type: [
    {
      name: "_activityKey",
      type: "string"
    },
    {
      name: "_goalValue",
      type: "uint256"
    },
    {
      name: "_startTime",
      type: "uint256"
    },
    {
      name: "_endTime",
      type: "uint256"
    },
    {
      name: "_stake",
      type: "uint256"
    },
    {
      name: "_depositAmount",
      type: "uint256"
    },
    {
      name: "_userId",
      type: "string"
    }
  ]
}

export default domains;
