const {expect} = require("chai");
const {loadFixture} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const {deployPassportFixture} = require("./fixtures");
const {ZeroAddress} = require("ethers");

describe("Data Token", function () {

    describe("Constructor", function () {
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
    });

    describe("Transfer", function () {
        it("To 0x0 addr", async function () {
            const {dt_contract} = await loadFixture(deployPassportFixture);
            await expect(dt_contract.transfer(ZeroAddress, 10)).to.revertedWithCustomError(dt_contract, "ERC20InvalidReceiver");

        });

        it("0 DT", async function () {
            const {dt_contract, owner, user1, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 0;
            expect(await dt_contract.transfer(user1.address, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount);
        });

        it("Owner pays user", async function () {
            const {dt_contract, owner, user1, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.transfer(user1.address, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount);
        });

        it('User pays user', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.connect(owner).transfer(user1, amount)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user1.address, amount);
            expect(await dt_contract.balanceOf(owner.address)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount);
            expect(await dt_contract.connect(user1).transfer(user2, amount)).to.emit(dt_contract, "Transfer").withArgs(user1.address, user2.address, amount);
            expect(await dt_contract.balanceOf(user1.address)).to.equal(amount - amount);
            expect(await dt_contract.balanceOf(user2)).to.equal(amount);
        });

        it('User spends more than he owns', async function () {
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

    describe("Allowance", function () {
        it('Allowance', async function () {
            const {dt_contract, owner, user1} = await loadFixture(deployPassportFixture);
            let amount = 10;
            expect(await dt_contract.connect(owner).approve(user1, amount)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, amount);

            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);
        });

        it('Approve: spend all in one', async function () {
            const {dt_contract, owner, user1, user2, totalSupply} = await loadFixture(deployPassportFixture);
            let amount = 10;
            await dt_contract.connect(owner).approve(user1, amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);
            await dt_contract.connect(user1).transferFrom(owner, user2, amount);

            expect(await dt_contract.balanceOf(owner)).to.equal(totalSupply - amount);
            expect(await dt_contract.balanceOf(user2)).to.equal(amount);
            expect(await dt_contract.allowance(owner, user1)).to.equal(0);

        });

        it('Approve: spend all in many', async function () {
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

        it('Approve: spend not all', async function () {
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

        it('Approve: spend more than allowed', async function () {
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

        it('Approve: to 0x0', async function () {
            const {dt_contract, owner, user1} = await loadFixture(deployPassportFixture);
            let amount = 5;
            await dt_contract.connect(owner).approve(user1, amount);

            await expect(dt_contract.connect(user1).transferFrom(owner, ZeroAddress, amount)).to.be.revertedWithCustomError(dt_contract, 'ERC20InvalidReceiver');
        });

        it('Approve: approve to the 0x0', async function () {
            const {dt_contract, owner} = await loadFixture(deployPassportFixture);
            let amount = 5;
            await expect(dt_contract.connect(owner).approve(ZeroAddress, amount)).to.be.revertedWithCustomError(dt_contract, 'ERC20InvalidSpender');

            //await expect(Token.connect('0x0000000000000000000000000000000000000000').transferFrom('0x0000000000000000000000000000000000000000', owner, amount).to.be.revertedWith(''));
        });

        it('Approve: remove the approval', async function () {
            const {dt_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);
            const amount = 10;

            expect(await dt_contract.connect(owner).approve(user1, amount)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, amount);

            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);

            expect(await dt_contract.connect(owner).approve(user1, 0)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, 0);

            expect(await dt_contract.allowance(owner, user1)).to.equal(0);

            await expect(dt_contract.connect(user1).transferFrom(owner, user2, 1)).to.revertedWithCustomError(dt_contract, "ERC20InsufficientAllowance");
        });

        it('Approve: remove the approval after the approved has spent', async function () {
            const {dt_contract, owner, user1, user2} = await loadFixture(deployPassportFixture);
            const amount = 10;

            expect(await dt_contract.connect(owner).approve(user1, amount)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, amount);

            expect(await dt_contract.allowance(owner, user1)).to.equal(amount);

            expect(await dt_contract.connect(user1).transferFrom(owner, user2, 1)).to.emit(dt_contract, "Transfer").withArgs(owner.address, user2.address, 1);

            expect(await dt_contract.connect(owner).approve(user1, 0)).to.emit(dt_contract, "Approval").withArgs(owner.address, user1.address, 0);

            expect(await dt_contract.allowance(owner, user1)).to.equal(0);

            await expect(dt_contract.connect(user1).transferFrom(owner, user2, 1)).to.revertedWithCustomError(dt_contract, "ERC20InsufficientAllowance");
        });

    });
});