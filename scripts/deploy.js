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

const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
    let obtainedAddresses = {}
    const name = "addresses"
    obtainedAddresses[name] = {};

    addresses = obtainedAddresses[name];

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", balance.toString());

    // Deploy Deployer contract
    const Deployer = await ethers.getContractFactory("Deployer");
    const deployer_contract = await Deployer.deploy();
    await deployer_contract.waitForDeployment(); // Attendi il completamento del deployment
    const deployer_address = await deployer_contract.getAddress(); // Ottieni l'indirizzo corretto
    addresses.Deployer = deployer_address;
    console.log("Deployer address:", deployer_address);

    // Deploy ERC721Base contract
    const ERC721Base = await ethers.getContractFactory("ERC721Base");
    const baseContract = await ERC721Base.deploy();
    await baseContract.waitForDeployment();
    const baseAddress = await baseContract.getAddress();
    addresses.ERC721Base = baseAddress;
    console.log("ERC721Base address:", baseAddress);

    // Deploy ERC20Base contract
    const ERC20Base = await ethers.getContractFactory("ERC20Base");
    const base20Contract = await ERC20Base.deploy();
    await base20Contract.waitForDeployment();
    const base20Address = await base20Contract.getAddress();
    addresses.ERC20Base = base20Address;
    console.log("ERC20Base address:", base20Address);

    // Deploy ERC721Factory contract
    const ERC721Factory = await ethers.getContractFactory("ERC721Factory");
    const factory = await ERC721Factory.deploy(baseAddress, base20Address);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    addresses.ERC721Factory = factoryAddress;
    console.log("ERC721Factory address:", factoryAddress);

    obtainedAddresses[name] = addresses;

    const json = JSON.stringify(obtainedAddresses, null, 2);
    await fs.promises.writeFile(__dirname.replace('scripts','addresses/contractAddresses.json'), json)
        .catch((err) => {
            console.log("Error in writing addresses file!", err);
        });
    console.log("Addresses file correctly generated. Have a look in the ../addresses folder");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });