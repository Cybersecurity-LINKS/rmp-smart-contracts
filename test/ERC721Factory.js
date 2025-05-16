const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {deployFixture} = require("./fixtures");
const {expect} = require("chai");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {ethers} = require("hardhat");
describe("Deployment Test Suite", function () {
    it("Should set correct addresses in ERC721Factory", async function () {
        const {erc721Factory, erc721Base, erc20Base} = await loadFixture(deployFixture);

        // Assuming ERC721Factory has getter methods for base addresses
        const storedERC721Base = await erc721Factory.getERC721Base();
        const storedERC20Base = await erc721Factory.getERC20Base();

        expect(storedERC721Base).to.equal(await erc721Base.getAddress());
        expect(storedERC20Base).to.equal(await erc20Base.getAddress());
    });
});