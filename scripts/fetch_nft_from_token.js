require("dotenv").config();
const ethers = require("ethers");
const fs =require("fs") ;


//currentTime =  performance.now();
const addresses = JSON.parse(fs.readFileSync(process.env.ADDRESS_FILE)).addresses;


const provider = new ethers.getDefaultProvider(process.env.NETWORK_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY_ACCOUNT2, provider);

const ERC20 = require(process.env.SC_DIR + "/artifacts/contracts/ERC20Base.sol/ERC20Base.json");
const abi = ERC20.abi

// Specify the name of the DT you want to read
const desiredDTName = "Platinum-789273310"; // Change this to the name of the DT you want to read

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

const myNftContract = new ethers.Contract(DT.address, abi, signer)

const ERC721 = require(process.env.SC_DIR + "/artifacts/contracts/ERC721Base.sol/ERC721Base.json");
const abi1 = ERC721.abi


console.log(`Address ${process.env.PUBLIC_KEY_ACCOUNT2} wants to fetch the NFT linked to the token @ address: ${DT.address}`)


const fetchNFT = async () => {
    //currentTime =  performance.now();
    let balance = await myNftContract.balanceOf(process.env.PUBLIC_KEY_ACCOUNT2)
    console.log(`Token balance: ${ethers.formatEther(balance)}`)
    console.log(`Get NFT address`)
    let nftTxn = await myNftContract.getERC721()
    console.log(`NFT address! Check it out at: https://explorer.evm.testnet.iotaledger.net/address/${nftTxn}`)
    console.log(`Get the Passport`)
    const myNftContract1 = new ethers.Contract(nftTxn, abi1, signer)
    let nftTxn1 = await myNftContract1.tokenURI(1)
    //var x = JSON.parse(nftTxn1)
    console.log(`PassPort:`)
    console.log(JSON.parse(nftTxn1))
/*     currentTime1 =  performance.now();
    a = currentTime1 - currentTime;


    text = a.toString()
    text = (text + '\n')
     fs.appendFileSync('./tempi_fetch.log', text, err => {
        if (err) {
          console.error(err);
        }
    })  */
    //console.log(`Call to doSomething took ${text} milliseconds.`); 

}

fetchNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });