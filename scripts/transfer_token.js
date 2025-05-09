require("dotenv").config();
const ethers = require("ethers");
const fs =require("fs") ;

const provider = new ethers.getDefaultProvider(process.env.NETWORK_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ERC20 = require(process.env.SC_DIR + "/artifacts/contracts/ERC20Base.sol/ERC20Base.json");
const abi = ERC20.abi

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

//console.log(DT.address)
const myNftContract = new ethers.Contract(DT.address, abi, signer)

const toAddress = process.env.PUBLIC_KEY_ACCOUNT2
console.log(`Token transfer to ${toAddress}`)

const amount = ethers.utils.parseEther((DT.amount/2).toString());

const sendToken = async () => {
    //currentTime =  performance.now();
   // let nftTxn = await myNftContract.permit_transfer(fromAddress, fromAddress, 5)
    //await nftTxn.wait()
    let nftTxn1 = await myNftContract.transfer(toAddress, amount)
    await nftTxn1.wait()
    
    console.log(`Token transfer successfull! Check it out at: https://explorer.evm.testnet.iotaledger.net/tx/${nftTxn1.hash}`)
 

}

sendToken()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });