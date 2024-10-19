// createExpense.mjs

import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Ensure Ethers.js is properly imported
if (!ethers) {
	console.error("Ethers.js was not imported correctly or is not installed.");
	process.exit(1);
}

// Deployed contract address
const contractAddress = "0xCb2C120dB655AA50Db3C7156F51d413B1B3da5fB";

// Updated Contract ABI (ensure it matches the deployed contract)
const contractABI = [
	// expenseCount
	{
		inputs: [],
		name: "expenseCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	// groupCount
	{
		inputs: [],
		name: "groupCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	// createGroup
	{
		inputs: [
			{
				internalType: "string",
				name: "_name",
				type: "string",
			},
			{
				internalType: "address[]",
				name: "_members",
				type: "address[]",
			},
		],
		name: "createGroup",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	// createExpense
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_groupId",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "_amount",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "_description",
				type: "string",
			},
			{
				internalType: "address[]",
				name: "_participants",
				type: "address[]",
			},
		],
		name: "createExpense",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	// expenses
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "expenses",
		outputs: [
			{
				internalType: "uint256",
				name: "id",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "groupId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "payer",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "description",
				type: "string",
			},
			{
				internalType: "address[]",
				name: "participants",
				type: "address[]",
			},
			{
				internalType: "bool",
				name: "isSettled",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	// groups
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "groups",
		outputs: [
			{
				internalType: "uint256",
				name: "id",
				type: "uint256",
			},
			{
				internalType: "string",
				name: "name",
				type: "string",
			},
			{
				internalType: "address[]",
				name: "members",
				type: "address[]",
			},
			{
				internalType: "bool",
				name: "isActive",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	// groupExpenses
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "groupExpenses",
		outputs: [
			{
				internalType: "uint256[]",
				name: "",
				type: "uint256[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	// ExpenseCreated Event
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "id",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "groupId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "address",
				name: "payer",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "description",
				type: "string",
			},
			{
				indexed: false,
				internalType: "address[]",
				name: "participants",
				type: "address[]",
			},
		],
		name: "ExpenseCreated",
		type: "event",
	},
	// GroupCreated Event
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "uint256",
				name: "id",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "name",
				type: "string",
			},
			{
				indexed: false,
				internalType: "address[]",
				name: "members",
				type: "address[]",
			},
		],
		name: "GroupCreated",
		type: "event",
	},
];

// Initialize Provider
const provider = new ethers.JsonRpcProvider(
	"https://testnet.skalenodes.com/v1/juicy-low-small-testnet"
);

// Get Private Key from environment variables
const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
	console.error("PRIVATE_KEY is not defined in environment variables");
	process.exit(1);
}

// Initialize Wallet
let wallet;
try {
	wallet = new ethers.Wallet(privateKey, provider);
} catch (error) {
	console.error("Error creating the wallet:", error);
	process.exit(1);
}

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const userAddress = wallet.address;

/**
 * Creates a new group.
 * @param {string} name - The name of the group.
 * @param {string[]} members - Array of member addresses.
 * @returns {Promise<number>} - The ID of the created group.
 */
async function createGroup(name, members) {
	try {
		const tx = await contract.createGroup(name, members);
		console.log("Group creation transaction sent. Hash:", tx.hash);

		const receipt = await tx.wait();
		console.log("Group creation confirmed in block:", receipt.blockNumber);

		// Find the GroupCreated event
		const event = receipt.logs.find(
			(log) => log.fragment && log.fragment.name === "GroupCreated"
		);

		if (!event) {
			throw new Error("GroupCreated event not found");
		}

		const parsedLog = contract.interface.parseLog(event);
		const groupId = Number(parsedLog.args.id);
		console.log(`Created group ID: ${groupId}`);

		return groupId;
	} catch (error) {
		console.error("Error creating group:", error);
	}
}

/**
 * Crée une nouvelle dépense associée à un groupe spécifique.
 * @param {number} groupId - ID du groupe.
 * @param {string} amountEther - Montant en Ether (ex. "1.5").
 * @param {string} description - Description de la dépense.
 * @param {string[]} participants - Tableau des adresses des participants.
 * @param {string[]} sharesEther - Tableau des parts en Ether correspondant aux participants.
 * @returns {Promise<number>} - ID de la dépense créée.
 */
async function createExpense(
	groupId,
	amountEther,
	description,
	participants,
	sharesEther
) {
	try {
		const amount = ethers.utils.parseEther(amountEther);
		const shares = sharesEther.map((share) =>
			ethers.utils.parseEther(share)
		);

		// Vérifier que la somme des parts égale le montant total
		let totalShares = ethers.BigNumber.from(0);
		for (const share of shares) {
			totalShares = totalShares.add(share);
		}

		if (!totalShares.eq(amount)) {
			throw new Error(
				"La somme des parts n'est pas égale au montant total"
			);
		}

		const tx = await contract.createExpense(
			amount,
			description,
			participants,
			shares,
			groupId
		);
		console.log(
			"Transaction de création de dépense envoyée. Hash :",
			tx.hash
		);

		const receipt = await tx.wait();
		console.log("Dépense créée dans le bloc :", receipt.blockNumber);

		// Extraire l'événement ExpenseCreated
		let expenseId = null;
		for (const log of receipt.logs) {
			try {
				const parsedLog = contract.interface.parseLog(log);
				if (parsedLog.name === "ExpenseCreated") {
					expenseId = Number(parsedLog.args.id);
					console.log(`ID de la dépense créée : ${expenseId}`);
					break;
				}
			} catch (e) {
				// Ignorer les logs qui ne proviennent pas de notre contrat
			}
		}

		if (expenseId === null) {
			throw new Error("Événement ExpenseCreated non trouvé");
		}

		return expenseId;
	} catch (error) {
		console.error("Erreur lors de la création de la dépense :", error);
	}
}

/**
 * Retrieves an expense by its ID.
 * @param {number} expenseId - The ID of the expense.
 * @returns {Promise<Object>} - The expense details.
 */
async function getExpense(expenseId) {
	try {
		const expense = await contract.expenses(expenseId);
		return {
			id: expense.id.toString(),
			groupId: expense.groupId.toString(),
			payer: expense.payer,
			amount: ethers.formatEther(expense.amount),
			description: expense.description,
			participants: expense.participants,
			isSettled: expense.isSettled,
		};
	} catch (error) {
		console.error(`Error retrieving expense with ID ${expenseId}:`, error);
	}
}

/**
 * Retrieves the total number of expenses.
 * @returns {Promise<string>} - Total expenses count.
 */
async function getTotalExpenses() {
	try {
		const count = await contract.expenseCount();
		console.log(`Total number of expenses: ${count.toString()}`);
		return count.toString();
	} catch (error) {
		console.error("Error retrieving expenseCount:", error);
	}
}

/**
 * Retrieves the total number of groups.
 * @returns {Promise<string>} - Total groups count.
 */
async function getTotalGroups() {
	try {
		const count = await contract.groupCount();
		console.log(`Total number of groups: ${count.toString()}`);
		return count.toString();
	} catch (error) {
		console.error("Error retrieving groupCount:", error);
	}
}

// Example Usage
async function main() {
	try {
		await getTotalGroups();

		// Create a new group
		const groupName = "Friends Group";
		const groupMembers = [
			"0xfEbc40e5FE30f897813F6d85a3e292B1c35aa886",
			"0x79edB24F41Ec139dde29B6e604ed52954d643858",
			userAddress, // Adding the wallet's address as a member
		];

		const groupId = await createGroup(groupName, groupMembers);

		await getTotalGroups();

		// Create a new expense within the group
		const amount = "1"; // 1 Ether
		const description = "Dinner expense";
		const participants = [
			"0xfEbc40e5FE30f897813F6d85a3e292B1c35aa886",
			"0x79edB24F41Ec139dde29B6e604ed52954d643858",
		];

		await createExpense(groupId, amount, description, participants);

		await getTotalExpenses();
	} catch (error) {
		console.error("Error in main function:", error);
	}
}

main();
