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
const {deployAllFixture,} = require("./fixtures");

describe("Fixture Test", function () {

    it("Should deploy all contracts with valid addresses", async function () {
        const {
            Deployer,
            erc721Base,
            erc20Base,
            erc721Factory
        } = await loadFixture(deployAllFixture);

        expect(Deployer)
            .to.emit(Deployer, "InstanceDeployed")
            .withArgs(anyValue);
        expect(await Deployer.getAddress()).to.be.properAddress;
        expect(await ethers.provider.getCode(await Deployer.getAddress()))


        expect(erc721Base)
            .to.emit(erc721Base, "InstanceDeployed")
            .withArgs(anyValue);
        expect(await erc721Base.getAddress()).to.be.properAddress;
        expect(await ethers.provider.getCode(await erc721Base.getAddress()))

        expect(erc20Base)
            .to.emit(erc20Base, "InstanceDeployed")
            .withArgs(anyValue);
        expect(await erc20Base.getAddress()).to.be.properAddress;
        expect(await ethers.provider.getCode(await erc20Base.getAddress()))

        expect(erc721Factory)
            .to.emit(erc721Factory, "InstanceDeployed")
            .withArgs(anyValue);
        expect(await erc721Factory.getAddress()).to.be.properAddress;
        expect(await ethers.provider.getCode(await erc721Factory.getAddress()))
    });

    it("Should set correct addresses in ERC721Factory", async function () {
        const {erc721Factory, erc721Base, erc20Base} = await loadFixture(deployAllFixture);

        // Assuming ERC721Factory has getter methods for base addresses
        const storedERC721Base = await erc721Factory.getBase721ContractAddress();
        const storedERC20Base = await erc721Factory.getBase20ContractAddress();

        expect(storedERC721Base).to.equal(await erc721Base.getAddress());
        expect(storedERC20Base).to.equal(await erc20Base.getAddress());
    });

    it("Should have the correct owner", async function () {
        const {erc721Factory, owner} = await loadFixture(deployAllFixture);

        expect(await erc721Factory.owner()).to.equal(owner.address);
    });
});