require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("dotenv").config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL
module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.7" },
            { version: "0.8.0" },
            { version: "0.6.12" },
            { version: "0.4.19" },
            { version: "0.6.6" }
        ]
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                url: MAINNET_RPC_URL
            }
        },
        rinkeby: {
            chainId: 4,
            saveDeployments: true,
            blockConfirmations: 6,
            url: RINKEBY_RPC_URL,
            accounts: [PRIVATE_KEY]
        }
    },
    etherscan: {
        apiKey: {
            rinkeby: ETHERSCAN_API_KEY
        }
    },
    gasReporter: {
        enabled: false,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true
    },

    namedAccounts: {
        deployer: {
            default: 0,
            1: 0
        }
    },
    mocha: {
        timeout: 300000
    }
}
