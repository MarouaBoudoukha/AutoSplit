// attestation.mjs

import spSDK from "@ethsign/sp-sdk";
const { SignProtocolClient, SpMode, EvmChains } = spSDK;
import { privateKeyToAccount } from "viem/accounts";
import {
	client,
	schemaConfig,
	contract,
	contractABI,
	contractAddress,
	wallet,
	provider,
} from "./client.mjs";
import { initializeXMTPClient, sendXMTPNotification } from "./notification.mjs";

/**
 * Function to create the expense schema if it doesn't exist
 */
export async function ensureSchema() {
	if (schemaConfig.schemaId) {
		console.log(`Using existing schemaId: ${schemaConfig.schemaId}`);
		return schemaConfig.schemaId;
	}

	// Adapt fields to the Solidity "Expense" contract
	const schemaItems = [
		{ name: "id", type: "uint256" },
		{ name: "payer", type: "address" },
		{ name: "amount", type: "uint256" },
		{ name: "groupId", type: "uint256" },
		{ name: "description", type: "string" },
		{ name: "participants", type: "address[]" },
		{ name: "shares", type: "uint256[]" },
		{ name: "isSettled", type: "bool" },
	];

	try {
		const res = await client.createSchema({
			name: "Shared Expense",
			data: schemaItems,
		});

		console.log("Schema created:", res);
		schemaConfig.schemaId = res.schemaId;
		console.log(`Schema ID: ${schemaConfig.schemaId}`);
		return schemaConfig.schemaId;
	} catch (error) {
		console.error("Error while creating schema:", error);
		throw error;
	}
}

async function createExpenseOnChain(
	amount,
	description,
	participants,
	shares,
	groupId
) {
	try {
		console.log("Creating expense on the blockchain...");
		const tx = await contract.createExpense(
			amount,
			description,
			participants,
			shares,
			groupId
		);
		console.log("Transaction sent. Waiting for confirmation...");
		const receipt = await tx.wait();
		console.log("Transaction confirmed:", receipt);

		// Parse the logs to extract events
		const events = receipt.logs
			.map((log) => {
				try {
					return contract.interface.parseLog(log);
				} catch (e) {
					return null;
				}
			})
			.filter((event) => event !== null);

		// Find the 'ExpenseCreated' event
		const event = events.find((event) => event.name === "ExpenseCreated");
		if (!event) {
			console.error("Event 'ExpenseCreated' not found.");
			throw new Error("Missing 'ExpenseCreated' event.");
		}
		const expenseId = event.args.id;
		console.log(`Expense created on the blockchain with ID: ${expenseId}`);

		return expenseId;
	} catch (error) {
		console.error(
			"Error while creating the expense on the blockchain:",
			error
		);
		throw error;
	}
}

async function createGroupOnChain(name, members) {
	try {
		console.log("Creating group on the blockchain...");
		const tx = await contract.createGroup(name, members);
		const receipt = await tx.wait();
		console.log("Group creation transaction confirmed:", receipt);

		// Parse the logs to extract events
		const events = receipt.logs
			.map((log) => {
				try {
					return contract.interface.parseLog(log);
				} catch (e) {
					return null;
				}
			})
			.filter((event) => event !== null);

		// Find the 'GroupCreated' event
		const event = events.find((event) => event.name === "GroupCreated");
		if (!event) {
			console.error("Event 'GroupCreated' not found.");
			throw new Error("Missing 'GroupCreated' event.");
		}
		const groupId = event.args.id;
		console.log(`Group created on the blockchain with ID: ${groupId}`);

		return groupId;
	} catch (error) {
		console.error(
			"Error while creating the group on the blockchain:",
			error
		);
		throw error;
	}
}

async function updateExpenseWithAttestation(
	expenseId,
	attestationId,
	schemaId,
	indexingValue
) {
	try {
		const tx = await contract.updateExpenseWithAttestation(
			expenseId,
			attestationId,
			schemaId,
			indexingValue
		);
		await tx.wait();
		console.log(
			`Expense ${expenseId} updated with attestation information.`
		);
	} catch (error) {
		console.error(
			"Error while updating the expense with the attestation:",
			error
		);
		throw error;
	}
}

/**
 * Function to create an expense attestation
 */
export async function createAttestation(
	expenseId,
	payer,
	amount,
	description,
	participants,
	shares,
	groupId
) {
	try {
		const validations = participants.map(() => false); // No validation by default

		const attestationData = {
			id: expenseId.toString(),
			payer: payer,
			amount: amount.toString(),
			groupId: groupId.toString(),
			description: description,
			participants: participants,
			shares: shares.map((share) => share.toString()),
			isSettled: false,
		};

		console.log("Attestation data to validate:", attestationData);

		const res = await client.createAttestation({
			schemaId: schemaConfig.schemaId,
			data: attestationData,
			indexingValue: expenseId.toString(),
			recipients: participants,
			linkedAttestationId: null,
		});

		console.log("Attestation created:", res);

		// Initialiser le client XMTP
		const xmtpClient = await initializeXMTPClient();

		// Envoyer une notification à chaque participant
		for (const participant of participants) {
			const messageContent = `Une nouvelle attestation a été créée avec succès pour l'expense "${description}". Montant : ${amount}. Vous êtes impliqué dans cette transaction.`;
			await sendXMTPNotification(xmtpClient, participant, messageContent);
		}

		return res;
	} catch (error) {
		console.error("Error while creating the attestation:", error);
		throw error;
	}
}

/**
 * Function to retrieve and display attestation details
 */
export async function getAndDisplayAttestation(attestationId) {
	try {
		const attestation = await client.getAttestation(attestationId);
		if (!attestation) {
			console.error(`No attestation found with ID: ${attestationId}`);
			return;
		}

		attestation.attestationId = attestationId;

		console.log("Full attestation structure:");
		console.dir(attestation, { depth: null });

		const actualAttestationId = attestation.attestationId || "N/A";
		const actualIndexingValue = attestation.indexingValue || "N/A";

		console.log("Attestation details:");
		console.log(`Attestation ID: ${actualAttestationId}`);
		console.log(`Schema ID: ${attestation.schemaId || "N/A"}`);
		console.log(`Indexing Value: ${actualIndexingValue}`);
		console.log(`Attester: ${attestation.attester || "N/A"}`);
		console.log(
			`Timestamp: ${
				attestation.attestTimestamp
					? new Date(
							parseInt(attestation.attestTimestamp) * 1000
					  ).toISOString()
					: "N/A"
			}`
		);
		console.log("Attestation data:");
		const replacer = (key, value) =>
			typeof value === "bigint" ? value.toString() : value;
		console.log(JSON.stringify(attestation.data, replacer, 2));
	} catch (error) {
		console.error("Error while retrieving the attestation:", error);
	}
}

async function main() {
	try {
		console.log("Starting function tests...");

		// Step 1: Ensure the schema is properly configured
		const schemaId = await ensureSchema();
		console.log(`Schema used for attestations: ${schemaId}`);

		// Step 1.1: Create a new group
		const groupName = "Test Group";
		const groupMembers = [
			"0x1234567890abcdef1234567890abcdef12345678", // Payer
			"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
			"0x7890123456789012345678901234567890123456",
		];
		const groupId = await createGroupOnChain(groupName, groupMembers);
		console.log(`Group created with ID: ${groupId}`);

		// Test data for a new attestation
		const payer = "0x1234567890abcdef1234567890abcdef12345678"; // Fictitious payer address
		const amount = 100; // Expense amount as uint256
		const description = "Restaurant meal";
		const participants = [
			"0x8503d935eA859dF168625a7326f5FFC2c5807Dec",
			"0x7890123456789012345678901234567890123456",
		]; // Participant addresses
		const shares = [60, 40]; // Participant shares
		const groupIdToUse = groupId; // Use the created group ID

		// Step 2: Create a new expense on the smart contract
		const expenseId = await createExpenseOnChain(
			amount,
			description,
			participants,
			shares,
			groupIdToUse
		);
		console.log(`Expense created with ID: ${expenseId}`);

		// Step 3: Create a new attestation
		const attestation = await createAttestation(
			expenseId,
			payer,
			amount,
			description,
			participants,
			shares,
			groupIdToUse
		);
		console.log("New attestation successfully created:", attestation);

		// Step 4: Update the expense on the blockchain with attestation information
		await updateExpenseWithAttestation(
			expenseId,
			attestation.attestationId,
			schemaConfig.schemaId,
			attestation.indexingValue
		);
		console.log(
			`Expense ${expenseId} updated with attestation information.`
		);

		// Step 5: Retrieve and display the details of the created attestation
		const attestationId = attestation.attestationId; // Use the attestationId from the createAttestation response
		await getAndDisplayAttestation(attestationId);

		console.log("Function tests completed.");
	} catch (error) {
		console.error("Error during the testing process:", error);
	}
}
main();
