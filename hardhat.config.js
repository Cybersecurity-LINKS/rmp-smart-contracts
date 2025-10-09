// Copyright 2025 Fondazione LINKS

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
            url: 'https://json-rpc.evm.testnet.iota.cafe',
            chainId: 1076,
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
        'links': {
            url: 'https://json-rpc.evm.stardust.linksfoundation.com/dtcb-chain',
            chainId: 1074,
            gas: 2100000,
            gasPrice: 10_000_000_000,
            accounts: [process.env.PRIVATE_KEY]
        },
    },
    etherscan: {
        apiKey: {
            'iota-evm-testnet': 'ABCDE12345ABCDE12345ABCDE123456789',
            'links': 'empty'
        },
        customChains: [
            {
                network: 'iota-evm-testnet',
                chainId: 1076,
                urls: {
                    apiURL: "https://explorer.evm.testnet.iota.cafe/api",
                    browserURL: "https://explorer.evm.testnet.iota.cafe"
                },
                network: 'links',
                chainId: 1074,
                urls: {
                    apiURL: "https://explorer.tangle.stardust.linksfoundation.com/api",
                    browserURL: "https://explorer.tangle.stardust.linksfoundation.com/"
                }
            }
        ]
    }
};
