const {ethers} = require("hardhat");

async function deployAllFixture() {
    // Get the signers
    const [owner, otherAccount] = await ethers.getSigners();

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
        otherAccount
    };
}


// Fixture for Deployer
async function deployDeployerFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Deployer = await ethers.deployContract("Deployer");
    await Deployer.waitForDeployment();

    return {Deployer, owner, otherAccount};
}

// Fixture for token ERC721
async function deployERC721Fixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const ERC721Base = await ethers.getContractFactory("ERC721Base");
    const erc721Base = await ERC721Base.deploy();
    await erc721Base.waitForDeployment();

    return {erc721Base, owner, otherAccount};
}

// Fixture for token ERC20
async function deployERC20Fixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const ERC20Base = await ethers.getContractFactory("ERC20Base");
    const erc20Base = await ERC20Base.deploy();
    await erc20Base.waitForDeployment();

    return {erc20Base, owner, otherAccount};
}

// Fixture for Factory
async function deployFactoryFixture() {
    const {erc721Base, erc20Base, owner, otherAccount} = await deployAllFixture();
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
        otherAccount
    };
}

module.exports = {
    deployAllFixture,
    deployDeployerFixture,
    deployERC721Fixture,
    deployERC20Fixture,
    deployFactoryFixture

};
