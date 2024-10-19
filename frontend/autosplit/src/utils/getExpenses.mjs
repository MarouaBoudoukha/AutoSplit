// utils/getExpenses.mjs

import { ethers } from "ethers";
import { contractAddress, contractABI } from "./contractConfig.mjs";

//import dotenv from "dotenv";

// Load environment variables
//dotenv.config();

// Destructure environment variables
// const { PRIVATE_KEY, RPC_URL, CONTRACT_ADDRESS } = process.env;

// Validate environment variables
// if (!PRIVATE_KEY || !RPC_URL || !CONTRACT_ADDRESS) {
// 	console.error(
// 		"Please define PRIVATE_KEY, RPC_URL, and CONTRACT_ADDRESS in the .env file"
// 	);
// 	process.exit();
// }

//const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS || "0x0039bcf3e71149285BE372003De5ec1460cfc2fD";
const rpcUrl = process.env.REACT_APP_RPC_URL || "https://testnet.skalenodes.com/v1/juicy-low-small-testnet";
const privateKey = process.env.REACT_APP_PRIVATE_KEY;

//const contractAddress = "0x0039bcf3e71149285BE372003De5ec1460cfc2fD";

// Validate environment variables
if (!privateKey) {
	console.error("REACT_APP_PRIVATE_KEY is not defined in environment variables.");
  }

// Initialize the provider
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

//const privateKey = process.env.PRIVATE_KEY;

// Initialize the wallet
let wallet;
try {
  wallet = new ethers.Wallet(privateKey, provider);
} catch (error) {
  console.error("Error creating the wallet:", error);
  // Optionally, throw an error or handle it gracefully
}

// Initialize the contract
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Crée un nouveau groupe.
 * @param {string} name - Nom du groupe.
 * @param {string[]} members - Tableau des adresses des membres.
 * @returns {Promise<number>} - ID du groupe créé.
 */
export async function createGroup(name, members) {
	try {
		const tx = await contract.createGroup(name, members);
		console.log(
			"Transaction de création de groupe envoyée. Hash :",
			tx.hash
		);

		const receipt = await tx.wait();
		console.log("Groupe créé dans le bloc :", receipt.blockNumber);

		// Extraire l'événement GroupCreated
		let groupId = null;
		for (const log of receipt.logs) {
			try {
				const parsedLog = contract.interface.parseLog(log);
				if (parsedLog.name === "GroupCreated") {
					groupId = Number(parsedLog.args.id);
					console.log(`ID du groupe créé : ${groupId}`);
					break;
				}
			} catch (e) {
				// Ignorer les logs qui ne proviennent pas de notre contrat
			}
		}

		if (groupId === null) {
			throw new Error("Événement GroupCreated non trouvé");
		}

		return groupId;
	} catch (error) {
		console.error("Erreur lors de la création du groupe :", error);
	}
}

/**
 * Ajoute un nouveau membre à un groupe existant.
 * @param {number} groupId - ID du groupe.
 * @param {string} newMember - Adresse du nouveau membre.
 */
export async function addMemberToGroup(groupId, newMember) {
	try {
		const tx = await contract.addMemberToGroup(groupId, newMember);
		console.log("Transaction d'ajout de membre envoyée. Hash :", tx.hash);

		const receipt = await tx.wait();
		console.log("Membre ajouté dans le bloc :", receipt.blockNumber);
	} catch (error) {
		console.error("Erreur lors de l'ajout du membre :", error);
	}
}

/**
 * Crée une nouvelle dépense associée à un groupe spécifique.
 * @param {number} groupId - ID du groupe.
 * @param {string} amountEther - Montant en Ether (ex. "1.5").
 * @param {string} description - Description de la dépense.
 * @param {string[]} participants - Tableau des adresses des participants.
 * @param {string[]} sharesEther - Tableau des parts en Ether correspondant aux participants.
 * @returns {Promise<number>} - ID de la dépense créée.
 */
export async function createExpense(
	groupId,
	amountEther,
	description,
	participants,
	sharesEther
) {
	try {
		const amount = ethers.utils.parseEther(amountEther); // Returns BigInt
		const shares = sharesEther.map((share) => ethers.utils.parseEther(share)); // Array of BigInt

		// Use BigInt for totalShares
		let totalShares = ethers.BigNumber.from(0);
		for (const share of shares) {
			totalShares = totalShares.add(share);
		}

		if (!totalShares.eq(amount)) {
			throw new Error("La somme des parts n'est pas égale au montant total");
		}

		// Ensure groupId is BigInt
		//const groupIdBigInt = BigInt(groupId);

		const tx = await contract.createExpense(
			groupId,
			amount,
			description,
			participants,
			shares
			//groupIdBigInt
		);
		console.log(
			"Transaction de création de dépense envoyée. Hash :",
			tx.hash
		);

		const receipt = await tx.wait();
		console.log("Dépense créée dans le bloc :", receipt.blockNumber);

		// Extract the ExpenseCreated event
		let expenseId = null;
		for (const log of receipt.logs) {
			try {
				const parsedLog = contract.interface.parseLog(log);
				if (parsedLog.name === "ExpenseCreated") {
					expenseId = Number(parsedLog.args.id);
					console.log(`ID de la dépense créée : ${expenseId}`);
					break;
				}
			} catch (e) {
				// Ignore logs that are not from our contract
			}
		}

		if (expenseId === null) {
			throw new Error("Événement ExpenseCreated non trouvé");
		}

		return expenseId;
	} catch (error) {
		console.error("Erreur lors de la création de la dépense :", error);
		return null;
	}
}

/**
 * Récupère les détails d'une dépense par son ID.
 * @param {number} expenseId - ID de la dépense.
 * @returns {Promise<Object>} - Détails de la dépense.
 */
export async function getExpense(expenseId) {
	try {
		const expense = await contract.getExpense(expenseId);
		const formattedExpense = {
			id: Number(expense.id),
			groupId: Number(expense.groupId),
			payer: expense.payer,
			amount: ethers.utils.formatEther(expense.amount),
			description: expense.description,
			participants: expense.participants,
			isSettled: expense.isSettled,
		};
		console.log(`Détails de la dépense ${expenseId} :`, formattedExpense);
		return formattedExpense;
	} catch (error) {
		console.error(
			`Erreur lors de la récupération de la dépense ${expenseId} :`,
			error
		);
	}
}

/**
 * Récupère la part d'un utilisateur dans une dépense spécifique.
 * @param {number} expenseId - ID de la dépense.
 * @param {string} userAddress - Adresse de l'utilisateur.
 * @returns {Promise<string>} - Montant de la part en Ether.
 */
export async function getUserShare(expenseId, userAddress) {
	try {
		const share = await contract.getUserShare(expenseId, userAddress);
		const shareEther = ethers.utils.formatEther(share);
		console.log(
			`Part de l'utilisateur ${userAddress} dans la dépense ${expenseId} : ${shareEther} ETH`
		);
		return shareEther;
	} catch (error) {
		console.error(
			`Erreur lors de la récupération de la part de l'utilisateur dans la dépense ${expenseId} :`,
			error
		);
	}
}

/**
 * Récupère le nombre total de groupes.
 * @returns {Promise<number>} - Nombre total de groupes.
 */
export async function getTotalGroups() {
	try {
		const count = await contract.groupCount();
		const total = Number(count);
		console.log(`Nombre total de groupes : ${total}`);
		return total;
	} catch (error) {
		console.error("Erreur lors de la récupération de groupCount :", error);
	}
}

/**
 * Récupère le nombre total de dépenses.
 * @returns {Promise<number>} - Nombre total de dépenses.
 */
export async function getTotalExpenses() {
	try {
		const count = await contract.expenseCount();
		const total = Number(count);
		console.log(`Nombre total de dépenses : ${total}`);
		return total;
	} catch (error) {
		console.error(
			"Erreur lors de la récupération de expenseCount :",
			error
		);
	}
}

/**
 * Régler une dépense en remboursant la part de l'utilisateur.
 * @param {number} expenseId - ID de la dépense à régler.
 */
export async function settleExpense(expenseId) {
	try {
		// Récupérer la part de l'utilisateur pour cette dépense
		const share = await contract.getUserShare(expenseId, wallet.address);
		const amountToPay = share;

		const tx = await contract.settleExpense(expenseId, {
			value: amountToPay,
		});
		console.log(
			"Transaction de règlement de dépense envoyée. Hash :",
			tx.hash
		);

		const receipt = await tx.wait();
		console.log("Dépense réglée dans le bloc :", receipt.blockNumber);
	} catch (error) {
		console.error(
			`Erreur lors du règlement de la dépense ${expenseId} :`,
			error
		);
	}
}

/**
 * Récupère toutes les dépenses associées à un groupe.
 * @param {number} groupId - ID du groupe.
 * @returns {Promise<Object[]>} - Tableau des détails des dépenses.
 */
export async function getGroupExpenses(groupId) {
	try {
		const group = await contract.getGroup(groupId);
		const expenseIds = group.expenseIds;

		const expenses = [];
		for (const id of expenseIds) {
			const expense = await getExpense(Number(id));
			expenses.push(expense);
		}

		console.log(`Dépenses pour le groupe ${groupId} :`, expenses);
		return expenses;
	} catch (error) {
		console.error(
			`Erreur lors de la récupération des dépenses pour le groupe ${groupId} :`,
			error
		);
	}
}



/**
 * Récupère les détails d'un groupe par son ID.
 * @param {number} groupId - ID du groupe.
 * @returns {Promise<Object|null>} - Détails du groupe ou null en cas d'échec.
 */
export async function getGroup(groupId) {
	try {
	  const group = await contract.getGroup(groupId);

	  const formattedGroup = {
		id: group.id.toNumber(),
		name: group.name,
		members: group.members,
		expenseIds: group.expenseIds.map(id => id.toNumber()),
	  };

	  console.log(`Détails du groupe ${groupId} :`, formattedGroup);
	  return formattedGroup;
	} catch (error) {
	  console.error(`Erreur lors de la récupération du groupe ${groupId} :`, error);
	  return null;
	}
  }

// Function to get all groups
export async function getAllGroups(contract) {
	try {
	  const totalGroups = await getTotalGroups(contract);
	  const groups = [];
	  for (let groupId = 1; groupId <= totalGroups; groupId++) {
		const group = await getGroup(contract, groupId);
		if (group) {
		  groups.push(group);
		}
	  }
	  return groups;
	} catch (error) {
	  console.error("Error fetching all groups:", error);
	  return [];
	}
  }
/**
 * Fonction principale pour exécuter le script.
 */
/**
export async function main() {
	try {
		// Récupérer le nombre total de groupes
		await getTotalGroups();

		// Créer un nouveau groupe
		const groupName = "Friends Group";
		const groupMembers = [
			"0xfEbc40e5FE30f897813F6d85a3e292B1c35aa886",
			"0x538cFD76c4B97C5a87E1d5Eb2C7d026D08d34a81",
			wallet.address, // Ajouter l'adresse du portefeuille comme membre
		];

		const groupId = await createGroup(groupName, groupMembers);

		// Récupérer le nombre total de groupes après création
		await getTotalGroups();

		// Ajouter un nouveau membre au groupe
		const newMember = "0x1234567890abcdef1234567890abcdef12345678";
		await addMemberToGroup(groupId, newMember);

		// Créer une nouvelle dépense dans le groupe
		const amount = "0.5"; // 0.5 Ether
		const description = "Lunch";
		const participants = [
			"0xfEbc40e5FE30f897813F6d85a3e292B1c35aa886",
			"0x538cFD76c4B97C5a87E1d5Eb2C7d026D08d34a81",
			newMember,
		];
		// Définir les parts correspondant aux participants (en Ether)
		const shares = [
			"0.166666666666666666",
			"0.166666666666666667",
			"0.166666666666666667",
		]; // Somme = 0.5 ETH exactement

		const expenseId = await createExpense(
			groupId,
			amount,
			description,
			participants,
			shares
		);

		if (expenseId !== null) {
			// Récupérer les détails de la dépense
			await getExpense(expenseId);

			// Récupérer le nombre total de dépenses
			await getTotalExpenses();

			// Régler la dépense
			await settleExpense(expenseId);

			// Récupérer les détails de la dépense après règlement
			await getExpense(expenseId);

			// Récupérer les dépenses du groupe
			await getGroupExpenses(groupId);
		} else {
			console.error(
				"La dépense n'a pas été créée. Vérifiez les logs précédents."
			);
		}
	} catch (error) {
		console.error("Erreur dans la fonction principale :", error);
	}
}
**/
// Exécuter la fonction principale
//main();
