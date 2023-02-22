// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";


contract VolunteersNetwork is Ownable {
    struct Volunteer {
        bool isRegistered;
        uint personalId; 
        string profilDescription;
        bool isProposedToJoin;
        bool hasVotedForANewVolunteer;
        uint poapsExchanged;
        address addr;
    }

    struct Profil {
        string profilDescription;
        uint votedDescriptionCount;
        bool   isElected;
    } 

    struct WriteUp {
        string record;
        //hash
        //uint 8 id
    }

    struct BigElector{
        address addressVoter;
        bool hasVoted;
        bool votedResult;
    }

    struct VolunteerTime {
        uint meetingStartTime;
        uint meetingEndTime;
        address volunteerOnMeeting;
        uint timeOnAMeeting;
        uint totalTimeOnMeeting;
    }

    BigElector[3] tempElectors;

    enum WorkflowStatus {
        RegisteringVolunteers,
        ProposalsProfilDescription,
        StartVotingForANewVolunteerSession,
        EndVotingForANewVolunteerSession,
        RecordingStartTime,
        RecordingEndTime
    }


    event VolunteerRegistered(address volunteerAddress, uint id); 
    event VoteEmit(bool); 
    event CurrentWorkflowStatus(WorkflowStatus);
    event ProfilDescriptionAdded(string);
    event StartRecordingSession(address volunteerOnMeeting, uint meetingStartTime);
    event EndRecordingSession(address volunteerOnMeeting, uint meetingEndTime, uint timeOnAMeeting, uint totalTimeOnMeeting);

    mapping(address => Volunteer) public volunteers; 
    mapping(address => Profil) public profiles;
    mapping(address => VolunteerTime) [] volunteerTimes;
    
    address[] volunteersAddr;

    VolunteerTime[] public volunteerSessionTimesArray;
    WriteUp[] public writeUps;
    Profil[] public profils;

    uint256 public nextId = 0;
    uint256 startTime;
    uint256 endTime;
    uint256 timeConnected;

    WorkflowStatus public workflowStatus;


    constructor() {
        volunteers[msg.sender].isRegistered = true;
        volunteers[msg.sender].personalId = 0;
        workflowStatus = WorkflowStatus.RegisteringVolunteers;
        
        emit CurrentWorkflowStatus(workflowStatus); 
    }

    function addVolunteerByOwner(address _addressVolunteer) external onlyOwner{
        require(nextId < 6, "Only six volunteers can be added by the owner");
        require(workflowStatus == WorkflowStatus.RegisteringVolunteers, "Current Status is not correct workflow status");
        require(!volunteers[_addressVolunteer].isRegistered, "Volunteer is already registered");
        nextId++;
        volunteers[_addressVolunteer].isRegistered = true;
        volunteers[_addressVolunteer].personalId = nextId;
        volunteersAddr.push(_addressVolunteer);

        
       emit VolunteerRegistered(_addressVolunteer, nextId); 
    }


    function proposeSomeone(address _addr) external onlyOwner {
        require(nextId >= 6);
        require(!volunteers[_addr].isRegistered, "vous vous etes deja propose" );
        require(!volunteers[_addr].isProposedToJoin, "vous vous etes deja propose" );
        require(workflowStatus == WorkflowStatus.RegisteringVolunteers, "pas la bonne etape");
        volunteers[_addr].isProposedToJoin = true;
        workflowStatus = WorkflowStatus.ProposalsProfilDescription;

        emit CurrentWorkflowStatus(WorkflowStatus.ProposalsProfilDescription);
    }

    // function for the futur volunteer
    function addProfilDescription(string memory _descProfil) external {
        require(workflowStatus == WorkflowStatus.ProposalsProfilDescription, "Not correct status");
        require(owner()!=msg.sender, "pas d'owner");
        require(volunteers[msg.sender].isProposedToJoin, "Not registerd to join");
        require(keccak256(abi.encode(_descProfil)) != keccak256(abi.encode("")), "Vous ne pouvez pas ne rien proposer");
        
        profils.push(Profil(_descProfil, 0, false));
        workflowStatus = WorkflowStatus.ProposalsProfilDescription;

        emit ProfilDescriptionAdded(_descProfil);
    } 


    function Select3VotersForNewVolunteer() public onlyOwner returns (uint[3] memory) {
        require(!volunteers[msg.sender].hasVotedForANewVolunteer, "pas de double vote");
        require(workflowStatus == WorkflowStatus.ProposalsProfilDescription, "Not correct status");
        workflowStatus = WorkflowStatus.StartVotingForANewVolunteerSession;

        uint numVolunteers = volunteersAddr.length;
        uint[3] memory selectedVolunteers;
        uint numSelectedVolunteers = 0;
        uint randomIndex;

        while (numSelectedVolunteers < 3 && numVolunteers > 0) {
            randomIndex = (uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % (numVolunteers-1))+1;

            address selectedAddress = volunteersAddr[randomIndex];
            if (!volunteers[selectedAddress].hasVotedForANewVolunteer) {
                // check if index already in selectedVolunteers array
                bool alreadySelected = false;
                for (uint i = 0; i < numSelectedVolunteers; i++) {
                    if (selectedVolunteers[i] == randomIndex) {
                        alreadySelected = true;
                        break;
                    }
                }
                if (!alreadySelected) {
                    selectedVolunteers[numSelectedVolunteers] = randomIndex;
                    numSelectedVolunteers++;
                }
            }
            numVolunteers--;
        }

        tempElectors[0].addressVoter = volunteersAddr[selectedVolunteers[0]];
        tempElectors[1].addressVoter = volunteersAddr[selectedVolunteers[1]];
        tempElectors[2].addressVoter = volunteersAddr[selectedVolunteers[2]];

        return selectedVolunteers;
    }

    function isAuthorizedtoVote(address _addressVoter) internal view returns (bool) {
        bool isAuthorizedVoter = false;
        for (uint i = 0; i < 3; i++) {
            if (_addressVoter == tempElectors[i].addressVoter && !tempElectors[i].hasVoted) {
            isAuthorizedVoter = true;
            break;
        }
    }
    return isAuthorizedVoter;
    }


    function clearTempElectors() internal {
    for (uint i = 0; i < tempElectors.length; i++) {
        tempElectors[i].addressVoter = address(0);
        tempElectors[i].hasVoted = false;
        tempElectors[i].votedResult = false;
        }
    }


    function voteVoluteerByVolunteer(address _addressFuturVolunteer, bool _vote) external {
        require(profiles[_addressFuturVolunteer].isElected == false, "The volunteer has already been elected.");
        require(volunteers[_addressFuturVolunteer].isProposedToJoin == true, "The new volunteer does not exist or has not proposed yet.");
        require(isAuthorizedtoVote(msg.sender), "Only authorized voters can vote for the new volunteer.");
        require(!volunteers[msg.sender].hasVotedForANewVolunteer, "Vous ne pouvez pas voter deux fois");

        volunteers[msg.sender].hasVotedForANewVolunteer = true;

        if (_vote == true) {
            profiles[_addressFuturVolunteer].votedDescriptionCount++;
        }
        else {
            profiles[_addressFuturVolunteer].votedDescriptionCount = 0;
        }
        if (profiles[_addressFuturVolunteer].votedDescriptionCount >= 2){
            profiles[_addressFuturVolunteer].isElected = true;
            volunteers[_addressFuturVolunteer].isRegistered = true;
            volunteers[_addressFuturVolunteer].isProposedToJoin = false;
            volunteers[_addressFuturVolunteer].personalId = nextId++;
            volunteersAddr.push(_addressFuturVolunteer);
            workflowStatus = WorkflowStatus.EndVotingForANewVolunteerSession;

        }

        if (tempElectors[0].hasVoted && tempElectors[1].hasVoted && tempElectors[2].hasVoted ) {
            workflowStatus = WorkflowStatus.EndVotingForANewVolunteerSession;
            resetHasVotedForANewVolunteerIfAllVoted();
            clearTempElectors();
        }
    }

    function resetHasVotedForANewVolunteerIfAllVoted() public {
    
        uint volunteerWhoDoNotHasVotedCount = 0;

        for (uint i = 0; i < volunteersAddr.length; i++) {
            if (!volunteers[volunteersAddr[i]].hasVotedForANewVolunteer) {
                volunteerWhoDoNotHasVotedCount++;
            }
        }

        if (volunteerWhoDoNotHasVotedCount < 3) {
            for (uint i = 0; i < volunteersAddr.length; i++) {
                volunteers[volunteersAddr[i]].hasVotedForANewVolunteer = false;
            }
        }
    }


    //////////////////////States ///////////////////////////////
    function startRegisteringVolunteers() external onlyOwner {
        
        workflowStatus = WorkflowStatus.RegisteringVolunteers;

        emit CurrentWorkflowStatus(WorkflowStatus.RegisteringVolunteers);
    }


    function RecordingStartTimeSession() external onlyOwner {
        workflowStatus = WorkflowStatus.RecordingStartTime;

        emit CurrentWorkflowStatus(WorkflowStatus.RecordingStartTime);
    }

    function RecordingEndTimeSession() external onlyOwner {
        workflowStatus = WorkflowStatus.RecordingEndTime;

        emit CurrentWorkflowStatus(WorkflowStatus.RecordingEndTime);
    }
}