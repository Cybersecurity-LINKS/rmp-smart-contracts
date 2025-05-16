const {expect} = require("chai");
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {ethers} = require("hardhat");
const {deployAllFixture} = require("./fixtures");

describe("Depler Test Suite", function () {

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
/*
    describe("Contract Interactions", function () {
        it("Should allow Deployer contract to create new instances", async function () {
            const { deployerContract, erc721Base } = await loadFixture(deployFixture);

            const tx = await deployerContract.deploy(await erc721Base.getAddress());
            const receipt = await tx.wait();

            expect(receipt.logs[0].eventName).to.equal("InstanceDeployed");
            const deployedAddress = receipt.logs[0].args[0];
            expect(deployedAddress).to.be.properAddress;
        });

        it("Should create working ERC721 instances through the factory", async function () {
            const { erc721Factory } = await loadFixture(deployFixture);

            // Assuming the factory has a createToken method with name and symbol parameters
            const tx = await erc721Factory.createToken("Test Token", "TST");
            const receipt = await tx.wait();

            // Assuming the factory emits an event with the new token address
            const newTokenAddress = receipt.logs[0].args.tokenAddress;
            expect(newTokenAddress).to.be.properAddress;

            // Verify the new token instance
            const ERC721Base = await ethers.getContractFactory("ERC721Base");
            const newToken = ERC721Base.attach(newTokenAddress);

            expect(await newToken.name()).to.equal("Test Token");
            expect(await newToken.symbol()).to.equal("TST");
        });
    });

    describe("Error Handling", function () {
        it("Should revert when trying to initialize with zero addresses", async function () {
            const ERC721Factory = await ethers.getContractFactory("ERC721Factory");

            await expect(
                ERC721Factory.deploy(
                    ethers.ZeroAddress,
                    ethers.ZeroAddress
                )
            ).to.be.revertedWith("Invalid address");
        });

        it("Should prevent non-owners from calling restricted functions", async function () {
            const { erc721Factory, otherAccount } = await loadFixture(deployFixture);

            // Assuming there's a restricted function that only owner can call
            await expect(
                erc721Factory.connect(otherAccount).restrictedFunction()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

 */