//import {config} from "dotenv";

//config();
import {ethers} from "ethers";
//import fs from "fs";
import ERC721Factory from './ERC721Factory.json'
import addressesJson from './contractAddresses.json'


/* event NFTCreated(
    address newTokenAddress,
    address templateAddress,
    string tokenName,
    address admin,
    string symbol,
    string tokenURI
);
 */

//const currentTime =  performance.now();
//const addresses = JSON.parse(fs.readFileSync(import.meta.env.VITE_ADDRESS_FILE).toString()).addresses;
const addresses = addressesJson.addresses;

//console.log(`NFT address: ${addresses.ERC721Factory}`)


//publishAllinOne


export const mintNFT = async (passportJSONstring: string) => {
    //currentTime =  performance.now();

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const abi = ERC721Factory.abi;


    const myNftContract = new ethers.Contract(addresses.ERC721Factory, abi, signer)

    //console.log("Provider: ", provider)
    // console.log("Signer: ", signer)

    console.log("Contract Address: ", addresses.ERC721Factory);

    const passportJSON = JSON.parse(passportJSONstring);
    console.log("Passport JSON: ", passportJSON);


    const nftTxn = await myNftContract.publishAllinOne({
        name: passportJSON.typeOfMaterial,
        symbol: passportJSON.typeOfMaterial + passportJSON.passportId,
        tokenURI: JSON.stringify(passportJSON),
        // dt_name: "DT" + tokenUri.type,
        // dt_symbol: "DT" + tokenUri.type + "-" + tokenUri.id,
        dt_name: passportJSON.typeOfMaterial,
        dt_symbol: passportJSON.typeOfMaterial + "-" + passportJSON.passportId,
        maxSupply_: ethers.parseEther(passportJSON.quantity.toString()).toString(),
    })
    //console.log(nftTxn)
    const rc = await nftTxn.wait()
    // console.log(rc)
    console.log(`NFT Minted! Check it out at: https://explorer.evm.testnet.iotaledger.net/tx/${nftTxn.hash}`)
    let nftAddress;
    for (const l in rc.logs) {
        if (rc.logs[l].eventName == "NFTCreated") {
            console.log(rc.logs[l].eventName, rc.logs[l].args[0]);
            nftAddress = rc.logs[l].args[0];
        }
        /*
            for (const a in rc.logs[l].args){
                console.log(rc.logs[l].args[a]);
            }
         */
    }


    const DTtx = await myNftContract.getAllDTCreatedAddress()
    console.log(`Data Token address: https://explorer.evm.testnet.iotaledger.net/token/${DTtx[DTtx.length - 1]}`)
    console.log("DT address: ", DTtx[DTtx.length - 1])

    return {
        nftAddress: nftAddress,
        dtAddress: DTtx[DTtx.length - 1],
    }


}
