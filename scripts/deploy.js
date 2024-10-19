const { ethers } = require("hardhat");

async function main() {
	try {
		console.log("Starting deployment...");

		// Get the ContractFactory for the ExpenseShare contract
		const SharedExpenses = await ethers.getContractFactory("ExpenseShare");
		console.log("Contract factory created");

		// Deploy the contract
		console.log("Deploying contract...");
		const sharedExpenses = await SharedExpenses.deploy();

		// Wait for the deployment transaction to be mined
		console.log("Waiting for deployment transaction to be mined...");
		await sharedExpenses.deploymentTransaction().wait();

		// Get the deployed contract address
		const deployedAddress = await sharedExpenses.getAddress();

		// Log the deployed contract address
		console.log("SharedExpenses deployed to:", deployedAddress);
	} catch (error) {
		console.error("Error during deployment:", error);
		throw error;
	}
}

// Function to handle errors and run the script
main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
