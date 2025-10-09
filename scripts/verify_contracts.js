const hre = require("hardhat");
const fs = require("fs");

async function verifyContract(name, address, constructorArgs = []) {
    console.log(`\nVerification of contract ${name} at address ${address}...`);
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: constructorArgs,
            network: "iota-evm-testnet"
        });
        console.log(`✅ Contract ${name} successfully verified!`);
    } catch (error) {
        console.error(`❌ Error during verification of ${name}:`, error.message);
    }
}

async function main() {
    try {
        // Leggi gli indirizzi dal file
        const rawdata = fs.readFileSync('./addresses/contractAddresses.json');
        const contracts = JSON.parse(rawdata);

        console.log("Start verifying all contracts...");

        // Verifica Deployer
        await verifyContract(
            "Deployer",
            contracts.addresses.Deployer
        );

        // Verifica ERC721Base
        await verifyContract(
            "ERC721Base",
            contracts.addresses.ERC721Base
        );

        // Verifica ERC20Base
        await verifyContract(
            "ERC20Base",
            contracts.addresses.ERC20Base
        );

        // Verifica ERC721Factory
        await verifyContract(
            "ERC721Factory",
            contracts.addresses.ERC721Factory,
            [
                contracts.addresses.ERC721Base,
                contracts.addresses.ERC20Base
            ]
        );

        console.log("\n🎉 Verification process completed!");

    } catch (error) {
        console.error("Error while running the script:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
