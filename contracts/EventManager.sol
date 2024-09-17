// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC721 {
    function balanceOf(address owner) external view returns (uint256);
}

contract EventManager {

    struct Event {
        string name;
        string description;
        address organizer;
        uint256 eventTime;
        address nftAddress; //nft needed
        uint256 maxAttendees;
        uint256 ticketPrice;
        uint256 attendeeCount;
        mapping(address => bool) attendees;
    }

    uint256 public eventCount;
    mapping(uint256 => Event) public events;

    
    event EventCreated(uint256 eventId, string name, address indexed organizer, uint256 eventTime);

    
    event TicketClaimed(uint256 eventId, address indexed attendee);

   
    modifier onlyNFTHolder(address nftAddress) {
        require(IERC721(nftAddress).balanceOf(msg.sender) > 0, "You do not own the required NFT.");
        _;
    }

    // Create a new event (only callable by organizer)
    function createEvent(
        string memory _name,
        string memory _description,
        uint256 _eventTime,
        address _nftAddress,    // The NFT contract address required to join
        uint256 _maxAttendees,
        uint256 _ticketPrice
    ) external {
        eventCount++;
        Event storage newEvent = events[eventCount];
        newEvent.name = _name;
        newEvent.description = _description;
        newEvent.organizer = msg.sender;
        newEvent.eventTime = _eventTime;
        newEvent.nftAddress = _nftAddress;
        newEvent.maxAttendees = _maxAttendees;
        newEvent.ticketPrice = _ticketPrice;
        newEvent.attendeeCount = 0;

        emit EventCreated(eventCount, _name, msg.sender, _eventTime);
    }

    
    function claimTicket(uint256 _eventId) external payable onlyNFTHolder(events[_eventId].nftAddress) {
        Event storage e = events[_eventId];
        
        require(e.eventTime > block.timestamp, "Event already occurred");
        require(!e.attendees[msg.sender], "You already claimed a ticket.");
        require(e.attendeeCount < e.maxAttendees, "Event is full.");
        require(msg.value == e.ticketPrice, "Incorrect payment amount.");

        e.attendees[msg.sender] = true;
        e.attendeeCount++;

        emit TicketClaimed(_eventId, msg.sender);
    }

    // Withdraw ticket sales 
    function withdrawSales(uint256 _eventId) external {
        Event storage e = events[_eventId];
        require(e.organizer == msg.sender, "Only the organizer can withdraw sales.");

        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    
    function hasClaimedTicket(uint256 _eventId, address _user) external view returns (bool) {
        return events[_eventId].attendees[_user];
    }
}
