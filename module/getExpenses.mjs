// expenseShareInteraction.js

import { ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Destructure environment variables
// const { PRIVATE_KEY, RPC_URL, CONTRACT_ADDRESS } = process.env;

// Validate environment variables
// if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
// 	console.error(
// 		"Please define PRIVATE_KEY, RPC_URL, and CONTRACT_ADDRESS in the .env file"
// 	);
// 	process.exit(1);
// }

const contractAddress = "0x2412761f2f5c9CE4407A586E16C4dF7892053C2a";

// Initialize the provider
const provider = new ethers.JsonRpcProvider(
	"https://testnet.skalenodes.com/v1/juicy-low-small-testnet"
);

const privateKey = process.env.PRIVATE_KEY;

// Initialize the wallet
const wallet = new ethers.Wallet(privateKey, provider);

// ABI of the SharedExpenses contract
const contractABI = [
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "debtor",
				type: "address",
			},
			{
				indexed: true,
				internalType: "address",
				name: "creditor",
				type: "address",
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "amount",
				type: "uint256",
			},
		],
		name: "DebtRepaid",
		type: "event",
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
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "expenseId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "payer",
				type: "address",
			},
		],
		name: "ExpenseSettled",
		type: "event",
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
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "uint256",
				name: "groupId",
				type: "uint256",
			},
			{
				indexed: true,
				internalType: "address",
				name: "newMember",
				type: "address",
			},
		],
		name: "MemberAddedToGroup",
		type: "event",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_groupId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_newMember",
				type: "address",
			},
		],
		name: "addMemberToGroup",
		outputs: [],
		stateMutability: "nonpayable",
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
			{
				internalType: "uint256[]",
				name: "_shares",
				type: "uint256[]",
			},
			{
				internalType: "uint256",
				name: "_groupId",
				type: "uint256",
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
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address",
			},
			{
				internalType: "address",
				name: "",
				type: "address",
			},
		],
		name: "debts",
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
				internalType: "bool",
				name: "isSettled",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_debtor",
				type: "address",
			},
			{
				internalType: "address",
				name: "_creditor",
				type: "address",
			},
		],
		name: "getDebtBetween",
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
				name: "_expenseId",
				type: "uint256",
			},
		],
		name: "getExpense",
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
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_groupId",
				type: "uint256",
			},
		],
		name: "getGroup",
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
				internalType: "uint256[]",
				name: "expenseIds",
				type: "uint256[]",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_expenseId",
				type: "uint256",
			},
			{
				internalType: "address",
				name: "_user",
				type: "address",
			},
		],
		name: "getUserShare",
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
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
			{
				internalType: "uint256",
				name: "",
				type: "uint256",
			},
		],
		name: "groupExpenses",
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
				internalType: "bool",
				name: "isActive",
				type: "bool",
			},
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "_creditor",
				type: "address",
			},
			{
				internalType: "uint256",
				name: "_amount",
				type: "uint256",
			},
		],
		name: "repayDebt",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "_expenseId",
				type: "uint256",
			},
		],
		name: "settleExpense",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];

// Initialize the contract
// Initialize the contract
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Creates a new group.
 * @param {string} name - Name of the group.
 * @param {string[]} members - Array of member addresses.
 * @returns {Promise<number>} - ID of the created group.
 */
async function createGroup(name, members) {
	try {
		const tx = await contract.createGroup(name, members);
		console.log("Group creation transaction sent. Hash:", tx.hash);

		const receipt = await tx.wait();
		console.log("Group created in block:", receipt.blockNumber);

		// Extract the GroupCreated event
		let groupId = null;
		for (const log of receipt.logs) {
			try {
				const parsedLog = contract.interface.parseLog(log);
				if (parsedLog.name === "GroupCreated") {
					groupId = Number(parsedLog.args.id);
					console.log(`Created group ID: ${groupId}`);
					break;
				}
			} catch (e) {
				// Ignore logs that are not from our contract
			}
		}

		if (groupId === null) {
			throw new Error("GroupCreated event not found");
		}

		return groupId;
	} catch (error) {
		console.error("Error during group creation:", error);
	}
}

/**
 * Adds a new member to an existing group.
 * @param {number} groupId - Group ID.
 * @param {string} newMember - Address of the new member.
 */
async function addMemberToGroup(groupId, newMember) {
	try {
		const tx = await contract.addMemberToGroup(groupId, newMember);
		console.log("Member addition transaction sent. Hash:", tx.hash);

		const receipt = await tx.wait();
		console.log("Member added in block:", receipt.blockNumber);
	} catch (error) {
		console.error("Error while adding the member:", error);
	}
}

/**
 * Creates a new expense associated with a specific group.
 * @param {number} groupId - Group ID.
 * @param {string} amountEther - Amount in Ether (e.g., "1.5").
 * @param {string} description - Description of the expense.
 * @param {string[]} participants - Array of participant addresses.
 * @param {string[]} sharesEther - Array of shares in Ether corresponding to participants.
 * @returns {Promise<number>} - ID of the created expense.
 */
async function createExpense(
	groupId,
	amountEther,
	description,
	participants,
	sharesEther
) {
	try {
		const amount = ethers.parseEther(amountEther); // Returns BigInt
		const shares = sharesEther.map((share) => ethers.parseEther(share)); // Array of BigInt

		// Use BigInt for totalShares
		let totalShares = 0n;
		for (const share of shares) {
			totalShares += share;
		}

		if (totalShares !== amount) {
			throw new Error(
				"The sum of the shares is not equal to the total amount"
			);
		}

		// Ensure groupId is BigInt
		const groupIdBigInt = BigInt(groupId);

		const tx = await contract.createExpense(
			amount,
			description,
			participants,
			shares,
			groupIdBigInt
		);
		console.log("Expense creation transaction sent. Hash:", tx.hash);

		const receipt = await tx.wait();
		console.log("Expense created in block:", receipt.blockNumber);

		// Extract the ExpenseCreated event
		let expenseId = null;
		for (const log of receipt.logs) {
			try {
				const parsedLog = contract.interface.parseLog(log);
				if (parsedLog.name === "ExpenseCreated") {
					expenseId = Number(parsedLog.args.id);
					console.log(`Created expense ID: ${expenseId}`);
					break;
				}
			} catch (e) {
				// Ignore logs that are not from our contract
			}
		}

		if (expenseId === null) {
			throw new Error("ExpenseCreated event not found");
		}

		return expenseId;
	} catch (error) {
		console.error("Error during expense creation:", error);
	}
}

/**
 * Retrieves the details of an expense by its ID.
 * @param {number} expenseId - Expense ID.
 * @returns {Promise<Object>} - Details of the expense.
 */
async function getExpense(expenseId) {
	try {
		const expense = await contract.getExpense(expenseId);
		const formattedExpense = {
			id: Number(expense.id),
			groupId: Number(expense.groupId),
			payer: expense.payer,
			amount: ethers.formatEther(expense.amount),
			description: expense.description,
			participants: expense.participants,
			isSettled: expense.isSettled,
		};
		console.log(`Details of expense ${expenseId}:`, formattedExpense);
		return formattedExpense;
	} catch (error) {
		console.error(
			`Error while retrieving the expense ${expenseId}:`,
			error
		);
	}
}

/**
 * Retrieves the share of a user in a specific expense.
 * @param {number} expenseId - Expense ID.
 * @param {string} userAddress - User's address.
 * @returns {Promise<string>} - User's share amount in Ether.
 */
async function getUserShare(expenseId, userAddress) {
	try {
		const share = await contract.getUserShare(expenseId, userAddress);
		const shareEther = ethers.formatEther(share);
		console.log(
			`User's share ${userAddress} in expense ${expenseId}: ${shareEther} ETH`
		);
		return shareEther;
	} catch (error) {
		console.error(
			`Error while retrieving the user's share in expense ${expenseId}:`,
			error
		);
	}
}

/**
 * Retrieves the total number of groups.
 * @returns {Promise<number>} - Total number of groups.
 */
async function getTotalGroups() {
	try {
		const count = await contract.groupCount();
		const total = Number(count);
		console.log(`Total number of groups: ${total}`);
		return total;
	} catch (error) {
		console.error("Error while retrieving groupCount:", error);
	}
}

/**
 * Retrieves the total number of expenses.
 * @returns {Promise<number>} - Total number of expenses.
 */
async function getTotalExpenses() {
	try {
		const count = await contract.expenseCount();
		const total = Number(count);
		console.log(`Total number of expenses: ${total}`);
		return total;
	} catch (error) {
		console.error("Error while retrieving expenseCount:", error);
	}
}

/**
 * Settles an expense by paying the user's share.
 * @param {number} expenseId - ID of the expense to settle.
 */
async function settleExpense(expenseId) {
	try {
		// Retrieve the user's share for this expense
		const share = await contract.getUserShare(expenseId, wallet.address);
		const amountToPay = share;

		const tx = await contract.settleExpense(expenseId, {
			value: amountToPay,
		});
		console.log("Expense settlement transaction sent. Hash:", tx.hash);

		const receipt = await tx.wait();
		console.log("Expense settled in block:", receipt.blockNumber);
	} catch (error) {
		console.error(`Error while settling expense ${expenseId}:`, error);
	}
}

/**
 * Retrieves all expenses associated with a group.
 * @param {number} groupId - Group ID.
 * @returns {Promise<Object[]>} - Array of expense details.
 */
async function getGroupExpenses(groupId) {
	try {
		const group = await contract.getGroup(groupId);
		const expenseIds = group.expenseIds;

		const expenses = [];
		for (const id of expenseIds) {
			const expense = await getExpense(Number(id));
			expenses.push(expense);
		}

		console.log(`Expenses for group ${groupId}:`, expenses);
		return expenses;
	} catch (error) {
		console.error(
			`Error while retrieving expenses for group ${groupId}:`,
			error
		);
	}
}

/**
 * Main function to run the script.
 */
async function main() {
	try {
		// Retrieve the total number of groups
		await getTotalGroups();

		// Create a new group
		const groupName = "Friends Group";
		const groupMembers = [
			"0xfEbc40e5FE30f897813F6d85a3e292B1c35aa886",
			"0x538cFD76c4B97C5a87E1d5Eb2C7d026D08d34a81",
			wallet.address, // Add the wallet address as a member
		];

		const groupId = await createGroup(groupName, groupMembers);

		// Retrieve the total number of groups after creation
		await getTotalGroups();

		// Add a new member to the group
		const newMember = "0x1234567890abcdef1234567890abcdef12345678";
		await addMemberToGroup(groupId, newMember);

		// Create a new expense in the group
		const amount = "0.5"; // 0.5 Ether
		const description = "Lunch";
		const participants = [
			"0xfEbc40e5FE30f897813F6d85a3e292B1c35aa886",
			"0x538cFD76c4B97C5a87E1d5Eb2C7d026D08d34a81",
			newMember,
		];
		// Define the shares corresponding to participants (in Ether)
		const shares = [
			"0.166666666666666666",
			"0.166666666666666667",
			"0.166666666666666667",
		]; // Total = 0.5 ETH exactly

		const expenseId = await createExpense(
			groupId,
			amount,
			description,
			participants,
			shares
		);

		if (expenseId !== null) {
			// Retrieve the expense details
			await getExpense(expenseId);

			// Retrieve the total number of expenses
			await getTotalExpenses();

			// Settle the expense
			await settleExpense(expenseId);

			// Retrieve the expense details after settlement
			await getExpense(expenseId);

			// Retrieve the group’s expenses
			await getGroupExpenses(groupId);
		} else {
			console.error(
				"The expense was not created. Check the previous logs."
			);
		}
	} catch (error) {
		console.error("Error in the main function:", error);
	}
}

// Execute the main function
main();
