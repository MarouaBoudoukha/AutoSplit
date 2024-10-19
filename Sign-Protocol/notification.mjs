// notification.mjs

import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
// import { privateKey } from "./config.mjs";

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

// Function to send a notification via XMTP
export async function sendXMTPNotification(
	xmtpClient,
	recipientAddress,
	messageContent
) {
	try {
		const isOnNetwork = await xmtpClient.canMessage(recipientAddress);
		if (isOnNetwork) {
			const conversation = await xmtpClient.conversations.newConversation(
				recipientAddress
			);
			await conversation.send(messageContent);
			console.log(`Notification sent to ${recipientAddress}`);
		} else {
			console.log(
				`The recipient ${recipientAddress} is not on the XMTP network`
			);
		}
	} catch (error) {
		console.error(
			`Error while sending the message to ${recipientAddress}:`,
			error
		);
	}
}

// Function to initialize the XMTP client
export async function initializeXMTPClient() {
	// Initialize the ethers wallet with the private key
	const wallet = new ethers.Wallet(privateKey);

	// Initialize the XMTP client
	const xmtp = await Client.create(wallet, { env: "dev" }); // Use 'production' if you are in production

	return xmtp;
}
