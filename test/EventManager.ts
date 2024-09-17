import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre, { ethers } from "hardhat";

describe("EventManager Test", async function(){
  

  async function deployNft(){

    const [owner] = await ethers.getSigners();

    const nftContract  = await ethers.getContractFactory("MyNFT");
    const nft = await nftContract.deploy(owner.address);

    return {owner, nft};
  }

  async function deployEventManager(){
    
    const [owner] = await ethers.getSigners();

    const eventManagerContract = await ethers.getContractFactory("EventManager");
    const eventManager = await eventManagerContract.deploy();
    // const nftAddress = "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D";

    return{owner, eventManager};
  }


  describe("CreateEvent", async function(){

    it("Should Emit correctly when new event created", async function (){

      const {eventManager, owner} = await loadFixture(deployEventManager);
      const {nft } = await loadFixture(deployNft);

      const nftAddress = nft.target;

      const name = "Blockchain";
      const description = "A good one";
      const nextBlockTimestamp = (await time.latest()) + 3600; // One hour from current time
      // Set the next block timestamp
      await time.setNextBlockTimestamp(nextBlockTimestamp);

      const eventTime = nextBlockTimestamp;
      const maxAttendees = 200;
      const ticketPrice = ethers.parseUnits("1",18);

      expect(
        await eventManager.createEvent(name,description,eventTime,nftAddress,maxAttendees,ticketPrice
      )).to.emit(eventManager,"EventCreated");
    })
  });

  describe("Claim Ticket", async function(){

    it("Should check if event time alreadt passed", async function(){

      const {eventManager, owner} = await loadFixture(deployEventManager);
      const {nft } = await loadFixture(deployNft);


      const nftAddress = nft.target;
      const name = "Blockchain";
      const description = "A good one";

      const nextBlockTimestamp = (await time.latest()) + 3600; // One hour from current time
      // Set the next block timestamp
      await time.setNextBlockTimestamp(nextBlockTimestamp);
      

      const eventTime = nextBlockTimestamp;
      const maxAttendees = 200;
      const ticketPrice = ethers.parseUnits("1",18);


      await eventManager.createEvent(name,description,eventTime,nftAddress,maxAttendees,ticketPrice);

      const [atendee] = await ethers.getSigners();
      await nft.mintNFT(atendee.address,"https://example.com/nft");

      const pastTime = (await time.latest()) + 7200;
      await time.setNextBlockTimestamp(pastTime);

      await expect( eventManager.connect(atendee).claimTicket(1,{ value: ticketPrice })).to.be.revertedWith("Event already occurred");

    });

    it("Should check if ticket already claimed", async function(){
      const {eventManager, owner} = await loadFixture(deployEventManager);
      const {nft } = await loadFixture(deployNft);


      const nftAddress = nft.target;
      const name = "Blockchain";
      const description = "A good one";

      const currentTime = (await time.latest());
      const eventTime = currentTime + 3600; 

      const maxAttendees = 200;
      const ticketPrice = ethers.parseUnits("1",18);


      await eventManager.createEvent(name,description,eventTime,nftAddress,maxAttendees,ticketPrice);


      const [atendee] = await ethers.getSigners();
      await nft.mintNFT(atendee.address,"https://example.com/nft");


      await eventManager.connect(atendee).claimTicket(1,{ value: ticketPrice });

      await expect(
         eventManager.connect(atendee).claimTicket(1,{ value: ticketPrice })).to.be.revertedWith("You already claimed a ticket.")
    });


    it("Should revert if ticket amount is correct" ,async function(){

      const {eventManager, owner} = await loadFixture(deployEventManager);
      const {nft } = await loadFixture(deployNft);


      const nftAddress = nft.target;
      const name = "Blockchain";
      const description = "A good one";

      const currentTime = (await time.latest());
      const eventTime = currentTime + 3600; 

      const maxAttendees = 200;
      const ticketPrice = ethers.parseUnits("2",18);


      await eventManager.createEvent(name,description,eventTime,nftAddress,maxAttendees,ticketPrice);


      const [atendee] = await ethers.getSigners();
      await nft.mintNFT(atendee.address,"https://example.com/nft");

      const amout = ethers.parseUnits("1",18);


      await expect 
      (eventManager.connect(atendee).claimTicket(1,{ value: amout })).to.be.revertedWith("Incorrect payment amount.");
    })


    it("Should revert if event is full", async function (){


      const {eventManager, owner} = await loadFixture(deployEventManager);
      const {nft } = await loadFixture(deployNft);


      const nftAddress = nft.target;
      const name = "Blockchain";
      const description = "A good one";

      const currentTime = (await time.latest());
      const eventTime = currentTime + 3600; 

      const maxAttendees = 1;
      const ticketPrice = ethers.parseUnits("2",18);


      await eventManager.createEvent(name,description,eventTime,nftAddress,maxAttendees,ticketPrice);


      const [atendee, secondAttendee] = await ethers.getSigners();
      await nft.mintNFT(atendee.address,"https://example.com/nft");
      await nft.mintNFT(secondAttendee.address,"https://example.com/nft");

      await eventManager.connect(atendee).claimTicket(1,{value:ticketPrice});

      await expect(eventManager.connect(secondAttendee).claimTicket(1,{value:ticketPrice})).to.be.revertedWith("Event is full.");
    })
  });

});