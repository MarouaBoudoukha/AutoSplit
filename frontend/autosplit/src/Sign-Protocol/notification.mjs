// notification.mjs

import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
// import { privateKey } from "./config.mjs";


const privateKey = '0xef060cb7d3f8ec2db57965356a38775806ed527dafe85a1ecee920f1673d4b0d';

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
	const xmtp = await Client.create(wallet, { env: "production" });

	return xmtp;
}
