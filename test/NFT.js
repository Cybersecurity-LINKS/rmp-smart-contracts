const {expect} = require("chai");
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {deployPassportFixture} = require("./fixtures");
const {ZeroAddress} = require("ethers");

describe("NFT", function () {
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
    });

    describe("Owner", function () {
        it('Owner: transfer to someone', async function () {
            const {nft_contract, owner, user1} = await loadFixture(deployPassportFixture);

            expect(await nft_contract.safeTransferFrom(owner.address, user1.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user1.address, 1);
            expect(await nft_contract.getNFTowner()).to.equal(user1.address);
        });

        it('Owner: transfer to someone that transfer to someone else', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            expect(await nft_contract.safeTransferFrom(owner.address, user1.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user1.address, 1);
            expect(await nft_contract.getNFTowner()).to.equal(user1.address);

            expect(await nft_contract.connect(user1).safeTransferFrom(user1.address, user2.address, 1)).to.emit(nft_contract, "Transfer").withArgs(user1.address, user2.address, 1);
            expect(await nft_contract.getNFTowner()).to.equal(user2.address);
        });
    });

    describe("Approval", function () {
        it('Approval', async function () {
            const {nft_contract, owner, user1} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).approve(user1.address, 1)).to.emit(nft_contract, "Approval").withArgs(owner.address, user1.address, 1);
        });

        it('Transfer', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).approve(user1.address, 1)).to.emit(nft_contract, "Approval").withArgs(owner.address, user1.address, 1);
            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user2.address, 1);
            expect(await nft_contract.ownerOf(1)).to.equal(user2.address);
        });

        it('For all', async function () {
            const {nft_contract, owner, user1} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).setApprovalForAll(user1.address, true)).to.emit(nft_contract, "ApprovalForAll").withArgs(owner.address, user1.address, true);
        });

        it('For all transfer', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(owner).setApprovalForAll(user1.address, true)).to.emit(nft_contract, "ApprovalForAll").withArgs(owner.address, user1.address, true);
            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1)).to.emit(nft_contract, "Transfer").withArgs(owner.address, user2.address, 1);
            expect(await nft_contract.ownerOf(1)).to.equal(user2.address);
        });

        it('Spend without approval', async function () {
            const {nft_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);

            await expect(nft_contract.connect(user1).safeTransferFrom(owner.address, user2.address, 1))
                .to.be.revertedWithCustomError(nft_contract, "ERC721InsufficientApproval")
                .withArgs(user1.address, 1);

        });

        it("Remove the approval", async function () {
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

        it("Remove the approval for all", async function () {
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