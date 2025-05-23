const {expect} = require("chai");
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {ethers} = require("hardhat");
const {
    deployAllFixture,
    deployFactoryFixture,
    deployERC721Fixture,
    deployERC20Fixture,
    deployPassportFixture
} = require("./fixtures");
const {ZeroAddress} = require("ethers");

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

    describe("Data Token", function () {

        it('Test Name', async function () {
            const {dt_contract} = await loadFixture(deployPassportFixture);
            expect(await dt_contract.name()).to.equal('Test Token');
        });

        it('Test Symbols', async function () {
            const {dt_contract} = await loadFixture(deployPassportFixture);
            expect(await dt_contract.symbol()).to.equal('TT');
        });

        it('Test Decimals', async function () {
            const {dt_contract} = await loadFixture(deployPassportFixture);
            expect(await dt_contract.decimals()).to.equal(18);
        });

        it('Total Supply', async function () {
            const {dt_contract, totalSupply} = await loadFixture(deployPassportFixture);
            expect(await dt_contract.totalSupply()).to.equal(totalSupply);
        });

        it("Balance of the deployer = total supply", async function () {
            const {dt_contract, owner, totalSupply} = await loadFixture(deployPassportFixture);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply);
        });

        it("Transfer to 0x0 addr", async function () {
            const {dt_contract} = await loadFixture(deployPassportFixture);
            await expect(dt_contract.transfer(ZeroAddress, 10)).to.revertedWithCustomError(dt_contract, "ERC20InvalidReceiver");

        });

        it("Test Transfer 0 DT", async function () {
            const {dt_contract, owner, user1, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 0;
            expect(await dt_contract.transfer(user1.address, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount);
        });

        it("Test Transfer: Owner pays user", async function () {
            const {dt_contract, owner, user1, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.transfer(user1.address, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount);
        });

        it('Test Transfer: User pays user', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.connect(owner).transfer(user1, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount);
            expect(await dt_contract.connect(user1).transfer(user2, amount)).to.emit(dt_contract, "Transfer").withArgs(user1.address, user2.address, amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount - amount);
            expect(await dt_contract.balanceOf(user2)).to.equal(amount);
        });

        it('Test Transfer: User spends more than he owns', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.connect(owner).transfer(user1, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user1)).to.equal(amount);
            await expect(dt_contract.connect(user1).transfer(user2, amount + 1)).to.be.revertedWithCustomError(dt_contract, "ERC20InsufficientBalance");
        });

        it('Test Burn', async function () {
            const {dt_contract, owner, user1} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.connect(owner).transfer(user1, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.connect(user1).burn(amount)).to.emit(dt_contract, "Transfer").withArgs(user1.address, ZeroAddress, amount);
            expect(await dt_contract.balanceOf(user1)).to.equal(0);
        });

        it('Test Allowance', async function () {
            const {dt_contract, owner, user1} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.connect(owner).approve(user1, amount)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, amount);

            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);
        });

        it('Test Approve: spend all in one', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            await dt_contract.connect(owner).approve(user1, amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);
            await dt_contract.connect(user1).transferFrom(owner, user2, amount);

            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user2)).to.equal(amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(0);

        });

        it('Test Approve: spend all in many', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 5;
            await dt_contract.connect(owner).approve(user1, amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 1);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 1);
            expect(await dt_contract.balanceOf(user2)).to.equal(1);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 2);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 2);
            expect(await dt_contract.balanceOf(user2)).to.equal(2);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 3);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 3);
            expect(await dt_contract.balanceOf(user2)).to.equal(3);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 4);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 4);
            expect(await dt_contract.balanceOf(user2)).to.equal(4);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.balanceOf(user2)).to.equal(amount);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(0);
        });

        it('Test Approve: spend not all', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 5;

            await dt_contract.connect(owner).approve(user1, amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 1);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 1);
            expect(await dt_contract.balanceOf(user2)).to.equal(1);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 2);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 2);
            expect(await dt_contract.balanceOf(user2)).to.equal(2);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 3);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 3);
            expect(await dt_contract.balanceOf(user2)).to.equal(3);

            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 3);
        });

        it('Test Approve: spend more than allowed', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 5;
            await dt_contract.connect(owner).approve(user1, amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 1);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 1);
            expect(await dt_contract.balanceOf(user2)).to.equal(1);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 2);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 2);
            expect(await dt_contract.balanceOf(user2)).to.equal(2);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 3);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 3);
            expect(await dt_contract.balanceOf(user2)).to.equal(3);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount - 4);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - 4);
            expect(await dt_contract.balanceOf(user2)).to.equal(4);

            await dt_contract.connect(user1).transferFrom(owner, user2, 1);
            expect(await dt_contract.balanceOf(user2)).to.equal(amount);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(0);

            await expect(dt_contract.connect(user1).transferFrom(owner, user2, 1)).to.revertedWithCustomError(dt_contract, "ERC20InsufficientAllowance");
        });

        it('Test Approve: to 0x0', async function () {
            const {dt_contract, owner, user1} = await loadFixture(deployPassportFixture);
            let amount = 5;
            await dt_contract.connect(owner).approve(user1, amount);

            await expect(dt_contract.connect(user1).transferFrom(owner, ZeroAddress, amount)).to.be.revertedWithCustomError(dt_contract, 'ERC20InvalidReceiver');
        });

        it('Test Approve: approve to the 0x0', async function () {
            const {dt_contract, owner} = await loadFixture(deployPassportFixture);
            let amount = 5;
            await expect(dt_contract.connect(owner).approve(ZeroAddress, amount)).to.be.revertedWithCustomError(dt_contract, 'ERC20InvalidSpender');

            //await expect(Token.connect('0x0000000000000000000000000000000000000000').transferFrom('0x0000000000000000000000000000000000000000', owner, amount).to.be.revertedWith(''));
        });

        it('Test Approve: remove the approval', async function () {
            const {dt_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);
            const amount = 10;

            expect(await dt_contract.connect(owner).approve(user1, amount)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, amount);

            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);

            expect(await dt_contract.connect(owner).approve(user1, 0)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, 0);

            expect(await dt_contract.allowance(owner, user1)).to.equal(0);

            await expect(dt_contract.connect(user1).transferFrom(owner, user2, 1)).to.revertedWithCustomError(dt_contract, "ERC20InsufficientAllowance");
        });

        it('Test Approve: remove the approval after the approved has spent', async function () {
            const {dt_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);
            const amount = 10;

            expect(await dt_contract.connect(owner).approve(user1, amount)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, amount);

            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);

            expect(await dt_contract.connect(user1).transferFrom(owner, user2, 1)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user2.address, 1);

            expect(await dt_contract.connect(owner).approve(user1, 0)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, 0);

            expect(await dt_contract.allowance(owner, user1)).to.equal(0);

            await expect(dt_contract.connect(user1).transferFrom(owner, user2, 1)).to.revertedWithCustomError(dt_contract, "ERC20InsufficientAllowance");
        });

        it("Re mint", async function () {
            const {dt_contract, owner, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.totalSupply()).to.equal(await dt_contract.getMaxSupply());
            expect(await dt_contract.burn(amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, ZeroAddress, amount);
            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - amount);
            expect(await dt_contract.totalSupply()).to.equal(totalSupply - amount);
            expect(await dt_contract.getMaxSupply()).to.equal(await dt_contract.totalSupply() + BigInt(amount));
            expect(await dt_contract.mint(owner.address, amount)).to.emit(dt_contract, "Transfer").withArgs(ZeroAddress, owner.address, amount);
            expect(await dt_contract.totalSupply()).to.equal(await dt_contract.getMaxSupply());
            expect(await dt_contract.balanceOf(owner)).to.be.equal(await dt_contract.getMaxSupply());
        });
    });

    describe("NFT", function () {
        it("NFT deploy", async function () {
            const {erc721Factory, nft_contract} = await loadFixture(deployPassportFixture);

            expect(await nft_contract.name()).to.equal("Test NFT");
            expect(await nft_contract.symbol()).to.equal("TNFT");
            expect(await nft_contract.tokenURI(1)).to.equal("ipfs://test");

            const dt_from_nft = await nft_contract.getDTaddresses();
            const dt_addr_from_nft = dt_from_nft[dt_from_nft.length - 1];

            const dts = await erc721Factory.getAllDTCreatedAddress();
            const dt_addr_from_factory = dts[dts.length - 1];

            expect(dt_addr_from_nft).to.equal(dt_addr_from_factory);

        });

        it("NFT owner", async function () {
            const {nft_contract, owner} = await loadFixture(deployPassportFixture);
            expect(await nft_contract.getNFTowner()).to.equal(owner.address);
        });

        it("Should not allow to mint another NFT on the same instance", async function () {
            const {nft_contract, owner, erc721Factory} = await loadFixture(deployPassportFixture);

            // try to initialize the contract for a new instance
            const newNFTData = {
                name: "Second NFT",
                symbol: "SNFT",
                tokenURI: "ipfs://test2"
            };

            // must fail, the contract is already initialized
            await expect(
                nft_contract.initialize(
                    owner.address,
                    erc721Factory.target,
                    newNFTData.name,
                    newNFTData.symbol,
                    newNFTData.tokenURI
                )
            ).to.be.revertedWithCustomError(nft_contract, "InvalidInitialization");

            // check that the first nft is still there
            expect(await nft_contract.balanceOf(owner.address)).to.equal(1n);

            expect(await nft_contract.name()).to.equal("Test NFT");
            expect(await nft_contract.symbol()).to.equal("TNFT");
            expect(await nft_contract.tokenURI(1)).to.equal("ipfs://test");
        });

        it('Owner transfer to someone', async function () {
            const {nft_contract, owner, user1} = await loadFixture(deployPassportFixture);

            expect(await nft_contract.safeTransferFrom(owner.address, user1.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user1.address, 1);
            expect(await nft_contract.getNFTowner()).to.equal(user1.address);
        });

        it('Owner transfer to someone that transfer to someone else', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            expect(await nft_contract.safeTransferFrom(owner.address, user1.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user1.address, 1);
            expect(await nft_contract.getNFTowner()).to.equal(user1.address);

            expect(await nft_contract.connect(user1).safeTransferFrom(user1.address, user2.address, 1)).to.emit(nft_contract, "Transfer").withArgs(user1.address, user2.address, 1);
            expect(await nft_contract.getNFTowner()).to.equal(user2.address);
        });

        it('Approval', async function () {
            const {nft_contract, owner, user1} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).approve(user1.address, 1)).to.emit(nft_contract, "Approval").withArgs(owner.address, user1.address, 1);
        });

        it('Approval transfer', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).approve(user1.address, 1)).to.emit(nft_contract, "Approval").withArgs(owner.address, user1.address, 1);
            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user2.address, 1);
            expect(await nft_contract.ownerOf(1)).to.equal(user2.address);
        });

        it('Approval for all', async function () {
            const {nft_contract, owner, user1} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).setApprovalForAll(user1.address, true)).to.emit(nft_contract, "ApprovalForAll").withArgs(owner.address, user1.address, true);
        });

        it('Approval for all transfer', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).setApprovalForAll(user1.address, true)).to.emit(nft_contract, "ApprovalForAll").withArgs(owner.address, user1.address, true);
            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user2.address, 1);
            expect(await nft_contract.ownerOf(1)).to.equal(user2.address);
        });

        it('Approval spend without approval', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1))
                .to.be.revertedWithCustomError(nft_contract, "ERC721InsufficientApproval")
                .withArgs(user1.address, 1);

        });

        it("Approval: remove the approval", async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).approve(user1.address, 1))
                .to.emit(nft_contract, "Approval").withArgs(owner.address, user1.address, 1);

            expect(await nft_contract.connect(user1).getApproved(1))
                .to.equal(user1.address);

            expect(await nft_contract.connect(owner).approve(ZeroAddress, 1))
                .to.emit(nft_contract, "Approval").withArgs(owner.address, ZeroAddress, 1);

            expect(await nft_contract.connect(user1).getApproved(1))
                .to.equal(ZeroAddress);

            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1))
                .to.be.revertedWithCustomError(nft_contract, "ERC721InsufficientApproval")
                .withArgs(user1.address, 1);
        });

        it("Approval: remove the approval for all", async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            expect(await nft_contract.connect(owner).setApprovalForAll(user1.address, true))
                .to.emit(nft_contract, "ApprovalForAll").withArgs(owner.address, user1.address, true);

            expect(await nft_contract.isApprovedForAll(owner.address, user1.address)).to.be.true;

            expect(await nft_contract.connect(owner).setApprovalForAll(user1.address, false))
                .to.emit(nft_contract, "ApprovalForAll").withArgs(owner.address, user1.address, false);

            expect(await nft_contract.isApprovedForAll(owner.address, user1.address)).to.be.false;

            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1))
                .to.be.revertedWithCustomError(nft_contract, "ERC721InsufficientApproval")
                .withArgs(user1.address, 1);
        });
    });
});