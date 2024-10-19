// notification.mjs

import { Client } from "@xmtp/xmtp-js";
import { ethers } from "ethers";
// import { privateKey } from "./config.mjs";

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

// Fonction pour envoyer une notification via XMTP
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
			console.log(`Notification envoyée à ${recipientAddress}`);
		} else {
			console.log(
				`Le destinataire ${recipientAddress} n'est pas sur le réseau XMTP`
			);
		}
	} catch (error) {
		console.error(
			`Erreur lors de l'envoi du message à ${recipientAddress}:`,
			error
		);
	}
}

// Fonction pour initialiser le client XMTP
export async function initializeXMTPClient() {
	// Initialiser le portefeuille ethers avec la clé privée
	const wallet = new ethers.Wallet(privateKey);

	// Initialiser le client XMTP
	const xmtp = await Client.create(wallet, { env: "dev" }); // Utilisez 'production' si vous êtes en production

	return xmtp;
}
