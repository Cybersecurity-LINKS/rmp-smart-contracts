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

const ERC20 = require(process.env.SC_DIR + "/artifacts/contracts/ERC20Base.sol/ERC20Base.json");
const abi1 = ERC20.abi

const myerc20Contract = new ethers.Contract(DT.address, abi1, signer)


const accumulateToken = async () => {
    //balance => bignumber https://docs.ethers.org/v5/api/utils/bignumber/#BigNumber--methods
    let balance = await myerc20Contract.balanceOf(process.env.PUBLIC_KEY_ACCOUNT2)
    console.log(`User Data Token amount: `)                                                                             ///
    console.log(balance.toString())
    //console.log(balance.div(2).toString())

    let nftTxn = await myNftContract.accumulateToken(DT.address, balance.div(2).toString())
    await nftTxn.wait()
    let nftTxn1 = await myNftContract.getaccumulatederc20Address()
    console.log(`accumulated Data Token address: `)
    console.log(nftTxn1)

    let amount = await myNftContract.getaccumulatederc20OfAddress(DT.address)
    console.log(`accumulated Data Token amount: `)
    console.log(amount.toString())
    
}

accumulateToken()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });