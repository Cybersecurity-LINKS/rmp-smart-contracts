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

const {ethers} = require("hardhat");

async function deployAllFixture() {
    // Get the signers
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy all contracts
    const Deployer = await ethers.deployContract("Deployer");
    await Deployer.waitForDeployment();


    const ERC721Base = await ethers.getContractFactory("ERC721Base");
    const erc721Base = await ERC721Base.deploy();
    await erc721Base.waitForDeployment();

    const ERC20Base = await ethers.getContractFactory("ERC20Base");
    const erc20Base = await ERC20Base.deploy();
    await erc20Base.waitForDeployment();

    const ERC721Factory = await ethers.getContractFactory("ERC721Factory");
    const erc721Factory = await ERC721Factory.deploy(
        await erc721Base.getAddress(),
        await erc20Base.getAddress()
    );
    await erc721Factory.waitForDeployment();

    return {
        Deployer,
        erc721Base,
        erc20Base,
        erc721Factory,
        owner,
        user1,
        user2
    };
}

// Fixture for token ERC721
async function deployERC721Fixture() {
    const [owner, user1] = await ethers.getSigners();
    const ERC721Base = await ethers.getContractFactory("ERC721Base");
    const erc721Base = await ERC721Base.deploy();
    await erc721Base.waitForDeployment();

    return {erc721Base, owner, user1};
}

// Fixture for token ERC20
async function deployERC20Fixture() {
    const [owner, user1] = await ethers.getSigners();
    const ERC20Base = await ethers.getContractFactory("ERC20Base");
    const erc20Base = await ERC20Base.deploy();
    await erc20Base.waitForDeployment();

    return {erc20Base, owner, user1};
}

// Fixture for Factory
async function deployFactoryFixture() {
    const {erc721Base, erc20Base, owner, user1} = await deployAllFixture();
    const ERC721Factory = await ethers.getContractFactory("ERC721Factory");
    const erc721Factory = await ERC721Factory.deploy(
        await erc721Base.getAddress(),
        await erc20Base.getAddress()
    );
    await erc721Factory.waitForDeployment();

    return {
        erc721Factory,
        erc721Base,
        erc20Base,
        owner,
        user1
    };
}

async function deployPassportFixture() {
    const {erc721Base, erc20Base, owner, user1, user2} = await deployAllFixture();
    const ERC721Factory = await ethers.getContractFactory("ERC721Factory");
    const erc721Factory = await ERC721Factory.deploy(
        await erc721Base.getAddress(),
        await erc20Base.getAddress()
    );
    await erc721Factory.waitForDeployment();

    const totalSupply = 100;

    const passport = {
        name: "Test NFT",
        symbol: "TNFT",
        tokenURI: "ipfs://test",
        dt_name: "Test Token",
        dt_symbol: "TT",
        maxSupply_: totalSupply
    };

    await erc721Factory.publishAllinOne(passport);

    const nfts = await erc721Factory.getAllNFTCreatedAddress();
    const nft_addr = nfts[nfts.length - 1];
    const ERC721 = await ethers.getContractFactory("ERC721Base");
    const nft_contract = ERC721.attach(nft_addr);

    const dts = await erc721Factory.getAllDTCreatedAddress();
    const dt_addr = dts[dts.length - 1];
    const ERC20 = await ethers.getContractFactory("ERC20Base");
    const dt_contract = ERC20.attach(dt_addr);


    return {
        erc721Factory,
        erc721Base,
        erc20Base,
        owner,
        user1,
        user2,
        nft_contract,
        dt_contract,
        totalSupply
    };
}

module.exports = {
    deployAllFixture,
    deployERC721Fixture,
    deployERC20Fixture,
    deployFactoryFixture,
    deployPassportFixture
};
