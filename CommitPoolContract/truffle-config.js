require("dotenv").config();

const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  compilers: {
    solc: {
      version: "0.6.10", // A version or constraint - Ex. "^0.5.0"
      // Can also be set to "native" to use a native solc
      docker: false,
      parser: "solcjs", // Leverages solc-js purely for speedy parsing
      settings: {
        optimizer: {
          enabled: false,
          runs: 200, // Optimize for how many times you intend to run the code
        },
        evmVersion: "istanbul", // Default: "istanbul"
      },
    },
  },

  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*", // Match any network id
    },
    ropsten: {
      provider: function () {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://ropsten.infura.io/v3/bec77b2c1b174308bcaa3e622828448f",
        );
      },
      network_id: 3,
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          process.env.MNEMONIC,
          "https://rinkeby.infura.io/v3/bec77b2c1b174308bcaa3e622828448f",
        );
      },
      network_id: 4,
    },
    matic: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://rpc-mainnet.maticvigil.com/v1/e121feda27b4c1387cd0bf9a441e8727f8e86f56`),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    matic_mumbai: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://rpc-mumbai.matic.today`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
};
