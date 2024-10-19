// debt.js

import { ethers, formatEther } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const contractAddress = "0x0039bcf3e71149285BE372003De5ec1460cfc2fD";

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

/**
 * Initialize the contract
 */
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Function to retrieve the debt between two users
 * @param {string} debtorAddress
 * @param {string} creditorAddress
 * @returns {Promise<string>}
 */
export async function getIndividualDebt(debtorAddress, creditorAddress) {
	try {
		const debt = await contract.getDebtBetween(
			debtorAddress,
			creditorAddress
		);
		return debt.toString();
	} catch (error) {
		console.error(
			`Error retrieving debt between ${debtorAddress} and ${creditorAddress}:`,
			error
		);
		return "0";
	}
}

/**
 * Function to summarize debts among all participants
 * @param {Array<string>} participants
 * @returns {Promise<Object>}
 */
export async function summarizeDebts(participants) {
	const debtSummary = {};

	// Initialize the structure for each participant
	participants.forEach((participant) => {
		debtSummary[participant] = {
			owes: [], // Who the participant owes
			owedBy: [], // Who owes the participant
		};
	});

	// Iterate through all combinations of participants
	for (let i = 0; i < participants.length; i++) {
		for (let j = 0; j < participants.length; j++) {
			if (i !== j) {
				const debtor = participants[i];
				const creditor = participants[j];
				const debt = await getIndividualDebt(debtor, creditor);
				const debtInEther = formatEther(debt);
				if (parseFloat(debtInEther) > 0) {
					debtSummary[debtor].owes.push({
						to: creditor,
						amount: debtInEther,
					});
					debtSummary[creditor].owedBy.push({
						from: debtor,
						amount: debtInEther,
					});
				}
			}
		}
	}

	return debtSummary;
}

/**
 * Function to display the debt summary
 * @param {Object} debtSummary
 * @param {Array<string>} participants
 */
export function displayDebtSummary(debtSummary, participants) {
	participants.forEach((participant) => {
		console.log(`\nParticipant: ${participant}`);
		console.log("Who they owe:");
		if (debtSummary[participant].owes.length > 0) {
			debtSummary[participant].owes.forEach((debt) => {
				console.log(`  - ${debt.to} : ${debt.amount} ETH`);
			});
		} else {
			console.log("  - Owes nothing to anyone.");
		}

		console.log("Who owes them:");
		if (debtSummary[participant].owedBy.length > 0) {
			debtSummary[participant].owedBy.forEach((debt) => {
				console.log(`  - ${debt.from} : ${debt.amount} ETH`);
			});
		} else {
			console.log("  - Nobody owes them.");
		}
	});
}

// const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Fonction pour rembourser une dette à un créditeur
 * @param {string} creditorAddress - Adresse du créditeur
 * @param {string} amountEther - Montant à rembourser en ETH (comme string)
 * @returns {Promise<void>}
 */
export async function repayDebt(creditorAddress, amountEther) {
	try {
		const amountWei = ethers.parseEther(amountEther);

		const tx = await contract.repayDebt(creditorAddress, amountWei, {
			value: amountWei,
		});
		console.log(`Transaction envoyée. Hash: ${tx.hash}`);
		await tx.wait();
		console.log("Remboursement effectué avec succès.");

		// Vérifier la dette après remboursement
		const debt = await contract.getDebtBetween(
			wallet.address,
			creditorAddress
		);
		console.log(
			`Dette restante envers ${creditorAddress}: ${formatEther(debt)} ETH`
		);
	} catch (error) {
		console.error("Erreur lors du remboursement de la dette :", error);
	}
}

/**
 * Fonction principale pour démontrer le remboursement de dettes
 */
export async function main() {
	// Exemple de participants (remplacez par des adresses réelles)
	const debtor = wallet.address;
	const creditor = "0x8503d935eA859dF168625a7326f5FFC2c5807Dec";
	const amountToRepay = "0.01";

	console.log(`Dette initiale envers ${creditor}:`);

	// Vérifier la dette initiale
	const initialDebt = await getIndividualDebt(debtor, creditor);
	console.log(formatEther(initialDebt), "ETH");

	// Effectuer le remboursement
	await repayDebt(creditor, amountToRepay);

	// Vérifier la dette après remboursement
	const finalDebt = await getIndividualDebt(debtor, creditor);
	console.log(
		`Dette finale envers ${creditor}: ${formatEther(finalDebt)} ETH`
	);
}

// Conditional execution of the main script
main();
