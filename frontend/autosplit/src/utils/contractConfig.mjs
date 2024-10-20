// utils/contractConfig.mjs

export const contractAddress = "0x0039bcf3e71149285BE372003De5ec1460cfc2fD";

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
