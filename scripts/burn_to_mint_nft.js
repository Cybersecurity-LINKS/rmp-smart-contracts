require("dotenv").config();
const ethers = require("ethers");
const fs =require("fs") ;

/* event NFTCreated(
    address newTokenAddress,
    address templateAddress,
    string tokenName,
    address admin,
    string symbol,
    string tokenURI
);
 */
currentTime =  performance.now();
const addresses = JSON.parse(fs.readFileSync(process.env.ADDRESS_FILE)).addresses;

//console.log(`NFT address: ${addresses.ERC721Factory}`)

const provider = new ethers.getDefaultProvider(process.env.NETWORK_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT2, provider);

const ERC721Factory = require(process.env.SC_DIR + "/artifacts/contracts/ERC721Factory.sol/ERC721Factory.json");
const abi = ERC721Factory.abi

const myNftContract = new ethers.Contract(addresses.ERC721Factory, abi, signer)

// Specify the name of the DT you want to read
const desiredDTName = "Platinum-789273311"; // Change this to the name of the DT you want to read

let DTAddresses = JSON.parse(fs.readFileSync("./DTAddresses.json"));
let DT;
//Check if the field exists and if it is an array
if (DTAddresses[desiredDTName]) {
    if (Array.isArray(DTAddresses[desiredDTName])) {
        // If it's an array, take the first entry (you could change this to take a specific index if needed)
        DT = DTAddresses[desiredDTName][0];
    } else {
        // If it's an object, take the object
        DT = DTAddresses[desiredDTName];
    }
} else {
    console.log(`Error: Entry "${desiredDTName}" not found in DTAddresses.json`);
    process.exit(1); // Exit with an error code
}


const burnToMintNFT = async () => {


    let nftTxn = await myNftContract.burnToMint({
        name: "NFTproduct",
        symbol: "NFTproduct",
        tokenURI: '{"product" : "value"}',
        dt_name: "DT",
        dt_symbol: "DT",
        maxSupply_: ethers.utils.parseEther("0")
    })
    let x = await nftTxn.wait()
    //console.log(x.logs)
    console.log(`Factory address: https://explorer.evm.testnet.iotaledger.net/address/${addresses.ERC721Factory}`)

    let strings = await myNftContract.getadebugstring()
    console.log(strings)
    console.log(JSON.parse(strings))

    let nftTxn1 = await myNftContract.getaccumulatederc20Address()
    console.log(`accumulated Data Token address: `)
    console.log(nftTxn1)

}

burnToMintNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });