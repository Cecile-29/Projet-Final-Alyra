const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("--------------------------------------")
    arguments = []
    const VolunteersNetwork = await deploy("VolunteersNetwork", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    //Verify the smart contract 
    if (!developmentChains.includes(network.name)) {
        log("Verifying...")
        await verify(VolunteersNetwork.address, arguments)
    }
}

module.exports.tags = ["all", "volunteersnetwork", "main"]