const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of Volunteer smart contract", function () {
    let accounts;
    let volunteersNetwork;
    let deployer;
    let volunteer1;
    let volunteer2;
    let volunteer3;
    let volunteer4;

    before(async function () {
      accounts = await ethers.getSigners()
      deployer = accounts[0]
      volunteer1 = accounts[1]
      volunteer2 = accounts[2]
      volunteer3 = accounts[3]
      volunteer4 = accounts[4]
      volunteer5 = accounts[5]
      volunteer6 = accounts[6]
      futurVolunteer = accounts[7]
    })

    describe("tests function addVolunteerByOwner", async function () {
      beforeEach(async function () {
        await deployments.fixture(["volunteersnetwork"])
        volunteersNetwork = await ethers.getContract("VolunteersNetwork")
        accounts = await ethers.getSigners()
      })

      it("should be possible to add a volunteer by the owner", async function () {
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer1.address);
        let volunteer = await volunteersNetwork.volunteers(volunteer1.address);
        expect(volunteer.isRegistered).to.be.true;
        expect(volunteer.personalId).to.equal(1);
      })

      it("should emit when a volunteer is added", async function () {
        await expect(volunteersNetwork.addVolunteerByOwner(volunteer1.address)).to.emit(
          volunteersNetwork,
          "VolunteerRegistered"
        )
      })

      it("should check if a voter is already added", async function () {
        expect(volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer1.address),
          'Already registered')
      })

      it("should not be possible to add a volunteer twice", async function () {
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer1.address);
        await expect(volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer1.address))
          .to.be.revertedWith("Volunteer is already registered");
      })

      it("should not be possible for a volunteer to add a volunteer", async function () {
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer2.address);
        await expect(volunteersNetwork.connect(volunteer2).addVolunteerByOwner(volunteer3.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
      })

      it("should not be possible to add a volunteer when there are already 6 registered", async function () {
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer1.address);
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer2.address);
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer3.address);
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer4.address);
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer5.address);
        await volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer6.address);

        // testing for more than six volunteers
        await expect(volunteersNetwork.connect(deployer).addVolunteerByOwner(futurVolunteer.address))
          .to.be.revertedWith("Only six volunteers can be added by the owner");
      })

      it("should be possible for the owner to add a volunteer in workflow enum phase (0)", async function () {
        // Get the current workflow status
        const currentWorkflowStatus = await volunteersNetwork.workflowStatus();

        // Verify that the current status is in phase (0)-RegisteringVolunteers
        assert.equal(currentWorkflowStatus, 0, "The current status is not in phase (0)-RegisteringVolunteers");
        await expect(volunteersNetwork.connect(deployer).addVolunteerByOwner(volunteer1.address))
          .to.emit(volunteersNetwork, "VolunteerRegistered")
          .withArgs(volunteer1.address, 1);

        assert.equal(await volunteersNetwork.workflowStatus(), currentWorkflowStatus, "The workflow status has is not correct");
      })
    })
  })
