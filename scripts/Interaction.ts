import hre, { ethers } from "hardhat";

async function main(){
    const nftAddress = "0xa2c1381B89FD986B4dbA4dbb03167A7655107308";
    const nftContract = await ethers.getContractAt("MyNFT",nftAddress);


    const eventManagerAddress = "0x9741A96b213aCD9CAEb3B069d0A068CE4520B854";
    const EventManagerContract = await ethers.getContractAt("EventManager",eventManagerAddress);

    

    const [owner]= await hre.ethers.getSigners();
    const mintNFT = await nftContract.mintNFT(owner.address,"https://ipfs.io/ipfs/QmWL4dztPBsWa6BUTqqmJBkwwLTndMdpkCC1ij4ug3fb5g");


   

    const name = "Lisk Blockchain Event";
    const description = "An Event to enlighten more about Lisk";


    const latestBlock = await ethers.provider.getBlock('latest');// getting latest block
    const currentTimestamp = await latestBlock?.timestamp; //current block timestamp
    if (currentTimestamp === undefined) {
        throw new Error("Failed to retrieve current block timestamp.");
    }
    const time = 2 * 60 * 60; //future time 

    const eventTime = currentTimestamp + time;
    const maxAttendees = 200;
    const ticketPrice = ethers.parseUnits("1",18);

    const tx = await EventManagerContract.createEvent(name,description,eventTime,nftAddress,maxAttendees,ticketPrice);

    const reciept = await tx.wait();

    console.log(reciept);

    console.log(`Event Created successfully with id: ${reciept}}`)




}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
   });