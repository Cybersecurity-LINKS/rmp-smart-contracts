require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();


task("faucet", "Sends ETH and tokens to an address")
    .addPositionalParam("receiver", "The address that will receive them")
    .setAction(async ({receiver}, {ethers}) => {
        if (network.name === "hardhat") {
            console.warn(
                "You are running the faucet task with Hardhat network, which" +
                "gets automatically created and destroyed every time. Use the Hardhat" +
                " option '--network localhost'"
            );
        }

        const [sender] = await ethers.getSigners();

        const tx2 = await sender.sendTransaction({
            to: receiver,
            value: ethers.constants.WeiPerEther,
        });
        let rc = await tx2.wait();
        console.log(rc)
        console.log(`Transferred 1 ETH to ${receiver}`);
    });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.28",
    settings: {
        optimizer: {
            enabled: true,
            runs: 1,
        },
    },
    networks: {
        'iota-evm-testnet': {
            url: 'https://json-rpc.evm.testnet.iotaledger.net',
            chainId: 1075,
            gas: 2100000,
            gasPrice: 11_500_000_000,
            accounts: [process.env.PRIVATE_KEY],
        },
        'hardhat-issuer': {
            url: 'http://127.0.0.1:8545/',
            chainId: 31337,
            gas: 2100000,
            gasPrice: 8000000000,
            accounts: [process.env.PRIVATE_KEY],
        },
        'sepolia': {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
            chainId: 11155111,
            accounts: [process.env.PRIVATE_KEY]
        },
        links: {
            url: 'https://json-rpc.evm.stardust.linksfoundation.com/dtcb-chain',
            chainId: 1074,
            gas: 2100000,
            gasPrice: 10_000_000_000,
            accounts: [process.env.PRIVATE_KEY]
        },
    },
    etherscan: {
        apiKey: {
            'iota-evm-testnet': 'ABCDE12345ABCDE12345ABCDE123456789'
        },
        customChains: [
            {
                network: 'iota-evm-testnet',
                chainId: 1075,
                urls: {
                    apiURL: 'https://explorer.evm.testnet.iotaledger.net//api',
                    browserURL: 'https://explorer.evm.testnet.iotaledger.net//'
                }
            }
        ]
    }
};
