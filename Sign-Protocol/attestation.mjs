// attestation.mjs

import spSDK from "@ethsign/sp-sdk";
const { SignProtocolClient, SpMode, EvmChains } = spSDK;
import { privateKeyToAccount } from "viem/accounts";
import { client, schemaConfig } from "./client.mjs";

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

		// Test data for a new attestation
		const expenseId = 1;
		const payer = "0x1234567890abcdef1234567890abcdef12345678"; // Fictitious payer address
		const amount = 100; // Expense amount in uint256
		const description = "Restaurant meal";
		const participants = [
			"0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
			"0x7890123456789012345678901234567890123456",
		]; // Participants' addresses
		const shares = [60, 40]; // Participants' shares
		const groupId = 1; // Group associated with this expense (optional)

		// Step 2: Create a new attestation
		const attestation = await createAttestation(
			expenseId,
			payer,
			amount,
			description,
			participants,
			shares,
			groupId
		);
		console.log("New attestation successfully created:", attestation);

		// Step 3: Retrieve and display details of the created attestation
		const attestationId = attestation.attestationId; // Use the attestationId from createAttestation response
		await getAndDisplayAttestation(attestationId);

		console.log("End of function tests.");
	} catch (error) {
		console.error("Error during the test process:", error);
	}
}

// Execute main
main();
