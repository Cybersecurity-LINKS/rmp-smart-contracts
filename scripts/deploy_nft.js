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
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const ERC721Factory = require(process.env.SC_DIR + "/artifacts/contracts/ERC721Factory.sol/ERC721Factory.json");
const abi = ERC721Factory.abi

const myNftContract = new ethers.Contract(addresses.ERC721Factory, abi, signer)
//publishAllinOne
var tokenUri = require(process.env.SC_DIR + '/nft-metadata.json');
console.log("PASSPORT TO BE MINTED");
console.log(tokenUri);

const mintNFT = async () => {
    //currentTime =  performance.now();
    let nftTxn = await myNftContract.publishAllinOne({
        name: tokenUri._03_Type_of_material,
        symbol: tokenUri._03_Type_of_material + tokenUri._01_Passport_Id,
        tokenURI: JSON.stringify(tokenUri),
        // dt_name: "DT" + tokenUri.type,
        // dt_symbol: "DT" + tokenUri.type + "-" + tokenUri.id,
        dt_name: tokenUri._03_Type_of_material,
        dt_symbol: tokenUri._03_Type_of_material + "-" + tokenUri._01_Passport_Id,
        maxSupply_: ethers.utils.parseEther(tokenUri._06_Quantity)
    })
    //console.log(nftTxn)
    await nftTxn.wait()
   // console.log(rc)
    console.log(`NFT Minted! Check it out at: https://explorer.evm.testnet.iotaledger.net/tx/${nftTxn.hash}`)
    


    let nftTxn1 = await myNftContract.getAllDTCreatedAddress()
    console.log(`Data Token address: https://explorer.evm.testnet.iotaledger.net/token/${nftTxn1[nftTxn1.length - 1]}`)

    // Write the address, and metadata of the newly minted NFT to a file
    let obtainedDT = {}
    const name = tokenUri._03_Type_of_material + "-" + tokenUri._01_Passport_Id;
    obtainedDT[name] = {
        address: nftTxn1[nftTxn1.length - 1],
        amount: tokenUri._06_Quantity,
        type: tokenUri._03_Type_of_material,
        symbol: tokenUri._03_Type_of_material + tokenUri._01_Passport_Id,
        location: tokenUri.location,
        mined: tokenUri.mined,
        nftTxnHash: nftTxn.hash
    };

    // DT = obtainedDT[name];
    // DT.address = nftTxn1[nftTxn1.length - 1];
    // DT.amount = tokenUri.quantity_kg;
    // obtainedDT[name] = DT;

    // Read existing data from file, if it exists
    let existingData = {};
    try {
        const fileData = fs.readFileSync('./DTAddresses.json');
        existingData = JSON.parse(fileData);
    } catch (error) {
        // File doesn't exist or is empty, that's fine, we'll start fresh
        console.log("DTAddresses.json not found, creating a new one.");
    }

    /// Merge + append approach
    // Overwrites address and amount if the same DT is minted again
    // Merge new data with existing data
    const newData = { ...existingData, ...obtainedDT };


    // Write the merged data back to the file
    const json = JSON.stringify(newData, null, 2);
    await fs.promises.writeFile('./DTAddresses.json', json)
        .catch((err) => {
            console.log("Error in writing addresses file!", err);
        });


/*     currentTime1 =  performance.now();
    a = currentTime1 - currentTime;


    text = a.toString()
    text = (text + '\n')
     fs.appendFileSync('./tempi_10k_wait.log', text, err => {
        if (err) {
          console.error(err);
        }
    })
    console.log(`Call to doSomething took ${text} milliseconds.`);  */

}

mintNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });