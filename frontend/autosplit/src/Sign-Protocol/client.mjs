// client.js

import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";

import { privateKeyToAccount } from "viem/accounts";
import { ethers } from "ethers";


const privateKey = '0xef060cb7d3f8ec2db57965356a38775806ed527dafe85a1ecee920f1673d4b0d';

export const client = new SignProtocolClient(SpMode.OnChain, {
	chain: EvmChains.baseSepolia,
	account: privateKeyToAccount(privateKey),
});

export const schemaConfig = {
	schemaId: process.env.SCHEMA_ID || "",
	debtRepaymentSchemaId: process.env.DEBT_REPAYMENT_SCHEMA_ID || "",
};

export const contractAddress = "0xc8d957685a493F6989A971ca7F623439fB6E86ad";

// Initialize the provider
export const provider = new ethers.providers.JsonRpcProvider(
	"https://testnet.skalenodes.com/v1/juicy-low-small-testnet"
);

// Initialize the wallet
export const wallet = new ethers.Wallet(privateKey, provider);

// ABI of the SharedExpenses contract
export const contractABI = [
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
				name: "expenseId",
				type: "uint256",
			},
			{
				indexed: false,
				internalType: "string",
				name: "attestationId",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "schemaId",
				type: "string",
			},
			{
				indexed: false,
				internalType: "string",
				name: "indexingValue",
				type: "string",
			},
		],
		name: "ExpenseUpdatedWithAttestation",
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
			{ internalType: "uint256", name: "_groupId", type: "uint256" },
			{ internalType: "address", name: "_newMember", type: "address" },
		],
		name: "addMemberToGroup",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_amount", type: "uint256" },
			{ internalType: "string", name: "_description", type: "string" },
			{
				internalType: "address[]",
				name: "_participants",
				type: "address[]",
			},
			{ internalType: "uint256[]", name: "_shares", type: "uint256[]" },
			{ internalType: "uint256", name: "_groupId", type: "uint256" },
		],
		name: "createExpense",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "string", name: "_name", type: "string" },
			{ internalType: "address[]", name: "_members", type: "address[]" },
		],
		name: "createGroup",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "", type: "address" },
			{ internalType: "address", name: "", type: "address" },
		],
		name: "debts",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "expenseCount",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		name: "expenses",
		outputs: [
			{ internalType: "uint256", name: "id", type: "uint256" },
			{ internalType: "uint256", name: "groupId", type: "uint256" },
			{ internalType: "address", name: "payer", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
			{ internalType: "string", name: "description", type: "string" },
			{ internalType: "bool", name: "isSettled", type: "bool" },
			{ internalType: "string", name: "attestationId", type: "string" },
			{ internalType: "string", name: "schemaId", type: "string" },
			{ internalType: "string", name: "indexingValue", type: "string" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "_debtor", type: "address" },
			{ internalType: "address", name: "_creditor", type: "address" },
		],
		name: "getDebtBetween",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_expenseId", type: "uint256" },
		],
		name: "getExpense",
		outputs: [
			{ internalType: "uint256", name: "id", type: "uint256" },
			{ internalType: "uint256", name: "groupId", type: "uint256" },
			{ internalType: "address", name: "payer", type: "address" },
			{ internalType: "uint256", name: "amount", type: "uint256" },
			{ internalType: "string", name: "description", type: "string" },
			{
				internalType: "address[]",
				name: "participants",
				type: "address[]",
			},
			{ internalType: "bool", name: "isSettled", type: "bool" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_groupId", type: "uint256" },
		],
		name: "getGroup",
		outputs: [
			{ internalType: "uint256", name: "id", type: "uint256" },
			{ internalType: "string", name: "name", type: "string" },
			{ internalType: "address[]", name: "members", type: "address[]" },
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
			{ internalType: "uint256", name: "_expenseId", type: "uint256" },
			{ internalType: "address", name: "_user", type: "address" },
		],
		name: "getUserShare",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [],
		name: "groupCount",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "", type: "uint256" },
			{ internalType: "uint256", name: "", type: "uint256" },
		],
		name: "groupExpenses",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		name: "groups",
		outputs: [
			{ internalType: "uint256", name: "id", type: "uint256" },
			{ internalType: "string", name: "name", type: "string" },
			{ internalType: "bool", name: "isActive", type: "bool" },
		],
		stateMutability: "view",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "address", name: "_creditor", type: "address" },
			{ internalType: "uint256", name: "_amount", type: "uint256" },
		],
		name: "repayDebt",
		outputs: [],
		stateMutability: "payable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_expenseId", type: "uint256" },
		],
		name: "settleExpense",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [
			{ internalType: "uint256", name: "_expenseId", type: "uint256" },
			{ internalType: "string", name: "_attestationId", type: "string" },
			{ internalType: "string", name: "_schemaId", type: "string" },
			{ internalType: "string", name: "_indexingValue", type: "string" },
		],
		name: "updateExpenseWithAttestation",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
];

// Initialize the contract
// Initialize the contract
export const contract = new ethers.Contract(
	contractAddress,
	contractABI,
	wallet
);
