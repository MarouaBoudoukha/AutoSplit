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
const contractAddress = "0x858FDc65586B96189Bc7DB050165304633327C61";

// Contract ABI (ensure it is correct and matches the deployed contract)
const contractABI = [
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
	{
		inputs: [
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
];

const provider = new ethers.JsonRpcProvider(
	"https://testnet.skalenodes.com/v1/juicy-low-small-testnet"
);

const privateKey = process.env.PRIVATE_KEY;

if (!privateKey) {
	console.error("PRIVATE_KEY is not defined in environment variables");
	process.exit(1);
}

let wallet;
try {
	wallet = new ethers.Wallet(privateKey, provider);
} catch (error) {
	console.error("Error creating the wallet:", error);
	process.exit(1);
}

const contract = new ethers.Contract(contractAddress, contractABI, wallet);

const userAddress = wallet.address;

async function createExpense(amountEther, description, participants) {
	try {
		const amount = ethers.parseEther(amountEther.toString());
		const tx = await contract.createExpense(
			amount,
			description,
			participants
		);
		console.log("Transaction sent. Hash:", tx.hash);

		const receipt = await tx.wait();
		console.log("Transaction confirmed in block:", receipt.blockNumber);

		// Find the ExpenseCreated event
		const event = receipt.logs.find(
			(log) => log.fragment.name === "ExpenseCreated"
		);
		if (!event) {
			throw new Error("ExpenseCreated event not found");
		}

		const expenseId = event.args.id.toString();
		console.log(`Created expense ID: ${expenseId}`);

		const expense = await getExpense(expenseId);
		console.log("Created expense details:", expense);
	} catch (error) {
		console.error("Error creating expense:", error);
	}
}

async function getExpense(expenseId) {
	try {
		const expense = await contract.expenses(expenseId);
		return {
			id: expense.id.toString(),
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

async function getTotalExpenses() {
	try {
		const count = await contract.expenseCount();
		console.log(`Total number of expenses: ${count.toString()}`);
		return count.toString();
	} catch (error) {
		console.error("Error retrieving expenseCount:", error);
	}
}

async function main() {
	try {
		await getTotalExpenses();

		const amount = "1"; // 1 Ether
		const description = "Dinner expense";
		const participants = [
			"0xfEbc40e5FE30f897813F6d85a3e292B1c35aa886",
			"0x79edB24F41Ec139dde29B6e604ed52954d643858",
		];

		await createExpense(amount, description, participants);

		await getTotalExpenses();
	} catch (error) {
		console.error("Error in main function:", error);
	}
}

main();
