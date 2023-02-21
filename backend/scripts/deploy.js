// // We require the Hardhat Runtime Environment explicitly here. This is optional
// // but useful for running the script in a standalone fashion through `node <script>`.
// //
// // You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat

const hre = require("hardhat");

async function deployVolunteersNetwork() {
  const VolunteersNetwork = await hre.ethers.getContractFactory("VolunteersNetwork");
  const volunteersNetwork = await VolunteersNetwork.deploy();
  console.log("VolunteersNetwork contract deployed to:", volunteersNetwork.address);

  const volunteerAddresses = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
    "0x976EA74026E726554dB657fA54763abd0C3a0aa9"
  ];

  for (let i = 0; i < volunteerAddresses.length; i++) {
    const volunteerAddress = volunteerAddresses[i];
    if (hre.ethers.utils.isAddress(volunteerAddress)) {
      setTimeout(async () => {
        await volunteersNetwork.addVolunteerByOwner(volunteerAddress);
        console.log(`Volunteer ${i + 1} added by owner`);
      }, 800 * i);
    } else {
      console.error("error parameter");
    }
  }

  const proposedAddress = "0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f";
  if (volunteerAddresses.length >= 6) {
    if (hre.ethers.utils.isAddress(proposedAddress)) {
      const proposedVolunteer = await volunteersNetwork.volunteers(proposedAddress);
      if (!proposedVolunteer.isProposedToJoin) {
        const workflowStatus = await volunteersNetwork.workflowStatus();
        if (workflowStatus == 0) {
          setTimeout(async () => {
            await volunteersNetwork.proposeSomeone(proposedAddress);
            console.log("New volunteer proposed");
          }, 800 * 6);
        } else {
          console.log("Not the right workflow status to propose a volunteer");
        }
      } else {
        console.log("Volunteer has already been proposed or is not registered");
      }
    } else {
      console.error("wrong parameter");
    }
  }
}

deployVolunteersNetwork().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
