require("dotenv").config();
require("@nomicfoundation/hardhat-foundry");
require("@openzeppelin/hardhat-upgrades");

if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config();
}

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.26",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
    ],
  },
  networks: {
    skale: {
      url: "https://testnet.skalenodes.com/v1/juicy-low-small-testnet",
      chainId: 0x561bf78b,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  sourcify: {
    enabled: false,
  },
};
