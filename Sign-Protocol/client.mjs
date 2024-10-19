// client.js

import spSDK from "@ethsign/sp-sdk";
const { SignProtocolClient, SpMode, EvmChains } = spSDK;
import { privateKeyToAccount } from "viem/accounts";

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

export const client = new SignProtocolClient(SpMode.OnChain, {
	chain: EvmChains.baseSepolia,
	account: privateKeyToAccount(privateKey),
});

export const schemaConfig = {
	schemaId: process.env.SCHEMA_ID || "",
	debtRepaymentSchemaId: process.env.DEBT_REPAYMENT_SCHEMA_ID || "",
};
