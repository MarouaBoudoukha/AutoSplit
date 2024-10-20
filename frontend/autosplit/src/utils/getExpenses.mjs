// utils/getExpenses.mjs

import { ethers } from "ethers";
import { contractABI } from "./contractConfig.mjs";

export const contractAddress =
  process.env.REACT_APP_CONTRACT_ADDRESS ||
  "0x2412761f2f5c9CE4407A586E16C4dF7892053C2a";
const rpcUrl =
  process.env.REACT_APP_RPC_URL ||
  "https://testnet.skalenodes.com/v1/juicy-low-small-testnet";
//const contractAddress = "0x0039bcf3e71149285BE372003De5ec1460cfc2fD";

// Initialize the provider
const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

//const privateKey = process.env.PRIVATE_KEY;

// Initialize the wallet
let wallet;
try {
  // const privateKey = process.env.REACT_APP_PRIVATE_KEY;
  const privateKey =
    "0x817b16d9e7fbeddcec78646c8257aa2e4ea66284b7ee608895c54f3cf0fc2b90";
  if (!privateKey) {
    console.error(
      "REACT_APP_PRIVATE_KEY is not defined in environment variables.",
    );
  }
  wallet = new ethers.Wallet(privateKey, provider);
} catch (error) {
  console.error("Error creating the wallet:", error);
  // Optionally, throw an error or handle it gracefully
}

export const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  wallet,
);

/**
 * Fetches debts between users.
 * @param {Object} contract - The contract instance.
 * @param {string[]} users - Array of user addresses.
 * @returns {Promise<Debt[]>} - Array of debts.
 */
export const getUserDebts = async (contract, users) => {
  const debts = [];
  try {
    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users.length; j++) {
        if (i !== j) {
          const debtor = users[i];
          const creditor = users[j];
          const debtAmount = await contract.getDebtBetween(debtor, creditor);
          if (debtAmount.gt(0)) {
            debts.push({
              debtor,
              creditor,
              amount: ethers.utils.formatEther(debtAmount),
            });
          }
        }
      }
    }
    return debts;
  } catch (error) {
    console.error("Error fetching user debts:", error);
    return [];
  }
};

/**
 * Repays a debt to a creditor.
 * @param {Object} contract - The contract instance.
 * @param {string} creditor - Creditor's Ethereum address.
 * @param {string} amountEther - Amount in ETH to repay.
 * @returns {Promise<boolean>} - Returns true if successful.
 */
export const repayDebt = async (contract, creditor, amountEther) => {
  try {
    // Fetch current debt
    const currentDebt = await getDebt(contract, creditor);
    if (!currentDebt) {
      console.error("Unable to fetch current debt.");
      return false;
    }

    const amountToRepay = ethers.utils.parseEther(amountEther);
    const currentDebtWei = ethers.utils.parseEther(currentDebt);

    // Check if repayment exceeds debt
    if (amountToRepay.gt(currentDebtWei)) {
      console.error("Repayment amount exceeds the outstanding debt.");
      return false;
    }

    const tx = await contract.repayDebt(creditor, amountToRepay, {
      value: amountToRepay,
      gasLimit: ethers.utils.hexlify(100000)
    });
    console.log("Repay debt transaction sent. Hash:", tx.hash);

    const receipt = await tx.wait();
    console.log("Debt repaid in block:", receipt.blockNumber);
    return true;
  } catch (error) {
    console.error("Error repaying debt:", error);
    return false;
  }
};




// Initialize the contract
//const contract = new ethers.Contract(contractAddress, contractABI, wallet);

/**
 * Crée un nouveau groupe.
 * @param {ethers.Contract} contract - The contract instance.
 * @param {string} name - Nom du groupe.
 * @param {string[]} members - Tableau des adresses des membres.
 * @returns {Promise<number>} - ID du groupe créé.
 */
export async function createGroup(contract, name, members) {
  try {
    const tx = await contract.createGroup(name, members);
    console.log("Transaction de création de groupe envoyée. Hash :", tx.hash);

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
 * @param {ethers.Contract} contract - The contract instance.
 * @param {number} groupId - ID du groupe.
 * @param {string} newMember - Adresse du nouveau membre.
 */
export async function addMemberToGroup(contract, groupId, newMember) {
  try {
    const tx = await contract.addMemberToGroup(contract, groupId, newMember);
    console.log("Transaction d'ajout de membre envoyée. Hash :", tx.hash);

    const receipt = await tx.wait();
    console.log("Membre ajouté dans le bloc :", receipt.blockNumber);
  } catch (error) {
    console.error("Erreur lors de l'ajout du membre :", error);
  }
}

/**
 * Crée une nouvelle dépense associée à un groupe spécifique.
 * @param {ethers.Contract} contract - The contract instance.
 * @param {number} groupId - ID du groupe.
 * @param {string} amountEther - Montant en Ether (ex. "1.5").
 * @param {string} description - Description de la dépense.
 * @param {string[]} participants - Tableau des adresses des participants.
 * @param {string[]} sharesEther - Tableau des parts en Ether correspondant aux participants.
 * @returns {Promise<number>} - ID de la dépense créée.
 */
export async function createExpense(
  contract,
  groupId,
  amountEther,
  description,
  participants,
  sharesEther,
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
      amount,
      description,
      participants,
      shares,
      groupId,
    );

    console.log("Transaction de création de dépense envoyée. Hash :", tx.hash);

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
 * @param {ethers.Contract} contract - The contract instance.
 * @param {number} expenseId - ID de la dépense.
 * @returns {Promise<Object>} - Détails de la dépense.
 */
export async function getExpense(contract, expenseId) {
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
      error,
    );
  }
}

/**
 * Récupère la part d'un utilisateur dans une dépense spécifique.
 * @param {ethers.Contract} contract - The contract instance.
 * @param {number} expenseId - ID de la dépense.
 * @param {string} userAddress - Adresse de l'utilisateur.
 * @returns {Promise<string>} - Montant de la part en Ether.
 */
export async function getUserShare(contract, expenseId, userAddress) {
  try {
    const share = await contract.getUserShare(expenseId, userAddress);
    const shareEther = ethers.utils.formatEther(share);
    console.log(
      `Part de l'utilisateur ${userAddress} dans la dépense ${expenseId} : ${shareEther} ETH`,
    );
    return shareEther;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération de la part de l'utilisateur dans la dépense ${expenseId} :`,
      error,
    );
  }
}

/**
 * Définit la limite de dette pour un créditeur spécifique.
 * @param {ethers.Contract} contract - Instance du contrat.
 * @param {string} creditorAddress - Adresse du créditeur.
 * @param {string} limitEther - Limite de dette en Ether (ex. "1.5").
 */
export async function setDebtLimit(contract, creditorAddress, limitEther) {
  try {
    const limit = ethers.utils.parseEther(limitEther);
    const tx = await contract.setDebtLimit(creditorAddress, limit);
    console.log("Transaction de définition de la limite de dette envoyée. Hash :", tx.hash);

    const receipt = await tx.wait();
    console.log("Limite de dette définie dans le bloc :", receipt.blockNumber);
  } catch (error) {
    console.error("Erreur lors de la définition de la limite de dette :", error);
  }
}

/**
 * Récupère la limite de dette entre un débiteur et un créditeur.
 * @param {ethers.Contract} contract - Instance du contrat.
 * @param {string} debtorAddress - Adresse du débiteur.
 * @param {string} creditorAddress - Adresse du créditeur.
 * @returns {Promise<string>} - Limite de dette en Ether.
 */
export async function getDebtLimit(contract, debtorAddress, creditorAddress) {
  try {
    const limit = await contract.getDebtLimit(debtorAddress, creditorAddress);
    const limitEther = ethers.utils.formatEther(limit);
    console.log(`Limite de dette entre ${debtorAddress} et ${creditorAddress} : ${limitEther} ETH`);
    return limitEther;
  } catch (error) {
    console.error("Erreur lors de la récupération de la limite de dette :", error);
  }
}

/**
 * @param {ethers.Contract} contract - The contract instance.
 * Récupère le nombre total de groupes.
 * @returns {Promise<number>} - Nombre total de groupes.
 */
export async function getTotalGroups(contract) {
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
 * @param {ethers.Contract} contract - The contract instance.
 * Récupère le nombre total de dépenses.
 * @returns {Promise<number>} - Nombre total de dépenses.
 */
export async function getTotalExpenses(contract) {
  try {
    const count = await contract.expenseCount();
    const total = Number(count);
    console.log(`Nombre total de dépenses : ${total}`);
    return total;
  } catch (error) {
    console.error("Erreur lors de la récupération de expenseCount :", error);
  }
}

/**
 * Régler une dépense en remboursant la part de l'utilisateur.
 * @param {ethers.Contract} contract - The contract instance.
 * @param {number} expenseId - ID de la dépense à régler.
 */
export async function settleExpense(contract, expenseId) {
  try {
    // Récupérer la part de l'utilisateur pour cette dépense
    const share = await contract.getUserShare(expenseId, wallet.address);
    const amountToPay = share;

    const tx = await contract.settleExpense(expenseId, {
      value: amountToPay,
    });
    console.log("Transaction de règlement de dépense envoyée. Hash :", tx.hash);

    const receipt = await tx.wait();
    console.log("Dépense réglée dans le bloc :", receipt.blockNumber);
  } catch (error) {
    console.error(
      `Erreur lors du règlement de la dépense ${expenseId} :`,
      error,
    );
  }
}

/**
 * Récupère toutes les dépenses associées à un groupe.
 * @param {ethers.Contract} contract - The contract instance.
 * @param {number} groupId - ID du groupe.
 * @returns {Promise<Object[]>} - Tableau des détails des dépenses.
 */
export async function getGroupExpenses(contract, groupId) {
  try {
    const group = await contract.getGroup(groupId);
    const expenseIds = group.expenseIds;

    const expenses = [];
    for (const id of expenseIds) {
      const expense = await getExpense(contract, Number(id));
      expenses.push(expense);
    }

    console.log(`Dépenses pour le groupe ${groupId} :`, expenses);
    return expenses;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des dépenses pour le groupe ${groupId} :`,
      error,
    );
  }
}

/**
 * Récupère les détails d'un groupe par son ID.
 * @param {ethers.Contract} contract - The contract instance.
 * @param {number} groupId - ID du groupe.
 * @returns {Promise<Group|null>} - Détails du groupe ou null en cas d'échec.
 */
export async function getGroup(contract, groupId) {
  try {
    const group = await contract.getGroup(groupId);

    const formattedGroup = {
      id: group.id.toNumber(),
      name: group.name,
      members: group.members,
      expenseIds: group.expenseIds.map((id) => id.toNumber()),
    };

    console.log(`Détails du groupe ${groupId} :`, formattedGroup);
    return formattedGroup;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du groupe ${groupId} :`,
      error,
    );
    return null;
  }
}

/**
 * Retrieves all groups.
 * @param {ethers.Contract} contract - The contract instance.
 * @returns {Promise<Group[]>}} - Returns an array of groups or null if an error occurs.
 */
export async function getAllGroups(contract) {
  try {
    const totalGroups = await contract.groupCount();
    const total = totalGroups.toNumber();
    const groups = [];
    for (let i = 1; i <= total; i++) {
      const group = await getGroup(contract, i);
      if (group) {
        groups.push(group);
      }
    }
    console.log(`Total Groups: ${groups.length}`);
    return groups;
  } catch (error) {
    console.error("Error fetching all groups:", error);
    return null;
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
