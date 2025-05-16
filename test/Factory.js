const {expect} = require("chai");
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {ethers} = require("hardhat");
const {deployAllFixture, deployFactoryFixture} = require("./fixtures");

describe("Factory Test Suite: check fixture deploy", function () {

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

describe("ERC721Factory", function () {

    describe("Contract Deployment", function () {
        it("Should deploy new ERC721 contract correctly", async function () {
            const {erc721Factory, owner} = await loadFixture(deployFactoryFixture);

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

        it("Should fail to deploy with invalid parameters", async function () {
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
                erc721Factory.deployERC721Contract(invalidData)
            ).to.be.revertedWith("some error message");
        });
    });

    describe("All-in-One Publishing", function () {
        it("Should publish NFT and DT in one transaction", async function () {
            // TODO Test for publishAllinOne
            expect(1).to.equal(0);
        });
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