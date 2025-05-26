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

const {expect} = require("chai");
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {ethers} = require("hardhat");
const {
    deployFactoryFixture,
    deployERC721Fixture,
    deployERC20Fixture,
} = require("./fixtures");
const {ZeroAddress} = require("ethers");

describe("ERC721Factory", function () {

    describe("Contract Deployment", function () {
        it("Should revert when trying to initialize with zero addresses ERC721", async function () {
            const {erc20Base} = await loadFixture(deployERC20Fixture);
            const ERC721Factory = await ethers.getContractFactory("ERC721Factory");

            await expect(
                ERC721Factory.deploy(
                    ZeroAddress,
                    erc20Base.getAddress()
                )
            ).to.be.revertedWith("Invalid ERC721Base contract address");
        });

        it("Should revert when trying to initialize with zero addresses ERC20", async function () {
            const {erc721Base} = await loadFixture(deployERC721Fixture);
            const ERC721Factory = await ethers.getContractFactory("ERC721Factory");

            await expect(
                ERC721Factory.deploy(
                    erc721Base.getAddress(),
                    ZeroAddress
                )
            ).to.be.revertedWith("Invalid ERC20Base contract address");
        });

        it("Should revert when trying to initialize with zero addresses both ERC20 and ERC721", async function () {
            const ERC721Factory = await ethers.getContractFactory("ERC721Factory");

            await expect(
                ERC721Factory.deploy(
                    ZeroAddress,
                    ZeroAddress
                )
            ).to.be.revertedWith("Invalid ERC721Base contract address");
        });

        it("Should deploy new ERC721 contract correctly", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const publishData = {
                name: "Test NFT",
                symbol: "TNFT",
                tokenURI: "ipfs://test",
                dt_name: "Test Token",
                dt_symbol: "TT",
                maxSupply_: ethers.parseEther("1000")
            };

            // Wait the event NFTCreated
            await expect(erc721Factory.deployERC721Contract(publishData))
                .to.emit(erc721Factory, "NFTCreated")
                .withArgs(
                    // use the matchers for the argoments
                    anyValue,  // newTokenAddress
                    anyValue,  // templateAddress
                    publishData.name,
                    anyValue,  // admin
                    publishData.symbol,
                    publishData.tokenURI
                );
        });

        it("Should deploy new ERC20 contract correctly", async function () {
            const {erc721Factory, owner} = await loadFixture(deployFactoryFixture);

            const publishData = {
                name: "Test NFT",
                symbol: "TNFT",
                tokenURI: "ipfs://test",
                dt_name: "Test Token",
                dt_symbol: "TT",
                maxSupply_: ethers.parseEther("1000")
            };

            // Usa publishAllinOne che crea sia NFT che ERC20 in una singola transazione
            const tx = await erc721Factory.publishAllinOne(publishData);
            const receipt = await tx.wait();

            // Trova prima l'evento NFTCreated per ottenere l'indirizzo dell'NFT
            const nftEvent = receipt.logs.filter(
                log => log.fragment && log.fragment.name === 'NFTCreated'
            )[0];

            expect(nftEvent).to.not.be.undefined;
            const nftAddress = nftEvent.args[0];

            // Trova l'evento ERC20ContractDeployed
            const erc20Event = receipt.logs.filter(
                log => log.fragment && log.fragment.name === 'ERC20ContractDeployed'
            )[0];

            expect(erc20Event).to.not.be.undefined;
            expect(erc20Event.args[0]).to.be.properAddress;    // contractAddress
            expect(erc20Event.args[1]).to.equal(owner.address); // contractOwner
            expect(erc20Event.args[2]).to.equal(publishData.dt_name);  // name
            expect(erc20Event.args[3]).to.equal(publishData.dt_symbol); // symbol

            // Verifica che l'ERC20 sia stato inizializzato correttamente
            const ERC20Base = await ethers.getContractFactory("ERC20Base");
            const erc20Instance = ERC20Base.attach(erc20Event.args[0]);

            expect(await erc20Instance.getDTowner()).to.equal(owner.address);
            expect(await erc20Instance.getMaxSupply()).to.equal(publishData.maxSupply_);
            expect(await erc20Instance.getERC721()).to.equal(nftAddress);
        });
    });
    describe("All-in-One Publishing", function () {
        it("Should fail to deploy with max supply 0", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "Test NFT",
                symbol: "TNFT",
                tokenURI: "ipfs://test",
                dt_name: "Test Token",
                dt_symbol: "TT",
                maxSupply_: 0
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.be.revertedWith("Factory: The maximum supply must be > 0");
        });

        it("Should fail to deploy with empty name", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "",
                symbol: "TNFT",
                tokenURI: "ipfs://test",
                dt_name: "Test Token",
                dt_symbol: "TT",
                maxSupply_: 10
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.be.revertedWith("Factory: NFT name empty");
        });

        it("Should fail to deploy with empty symbol", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "Test NFT",
                symbol: "",
                tokenURI: "ipfs://test",
                dt_name: "Test Token",
                dt_symbol: "TT",
                maxSupply_: 10
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.be.revertedWith("Factory: NFT symbol empty");
        });

        it("Should fail to deploy with empty URI", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "Test NFT",
                symbol: "TNFT",
                tokenURI: "",
                dt_name: "Test Token",
                dt_symbol: "TT",
                maxSupply_: 10
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.be.revertedWith("Factory: NFT URI empty");
        });

        it("Should fail to deploy with empty dt name", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "Test NFT",
                symbol: "TNFT",
                tokenURI: "ipfs://test",
                dt_name: "",
                dt_symbol: "TT",
                maxSupply_: 10
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.be.revertedWith("Factory: Token name empty");
        });

        it("Should fail to deploy with empty dt symbol", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "Test NFT",
                symbol: "TNFT",
                tokenURI: "ipfs://test",
                dt_name: "Test Token",
                dt_symbol: "",
                maxSupply_: 10
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.be.revertedWith("Factory: Token symbol empty");
        });

        it("Should fail to deploy with all empty and 0", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "",
                symbol: "",
                tokenURI: "",
                dt_name: "",
                dt_symbol: "",
                maxSupply_: 0
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.be.revertedWith("Factory: NFT name empty");
        });

        it("Should publish NFT and DT in one transaction", async function () {
            const {erc721Factory} = await loadFixture(deployFactoryFixture);

            const invalidData = {
                name: "Test NFT",
                symbol: "TNFT",
                tokenURI: "ipfs://test",
                dt_name: "Test Token",
                dt_symbol: "TT",
                maxSupply_: 10
            };

            await expect(
                erc721Factory.publishAllinOne(invalidData)
            ).to.emit(erc721Factory, "NFTCreated").and.to.emit(erc721Factory, "ERC20ContractDeployed");
        });

    });
});