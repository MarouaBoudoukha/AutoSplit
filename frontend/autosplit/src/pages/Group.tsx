// Group.tsx

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Balances from "../components/GroupSections/Balances";
import Users from "../components/GroupSections/Users";
import {
  getGroup,
  getGroupExpenses,
  getUserDebts,
  repayDebt,
  contract,
} from "../utils/getExpenses.mjs";
import { ethers } from "ethers";

// Import functions from the attestation module
import {
  ensureSchema,
  createAttestation,
  updateExpenseWithAttestation,
} from "../Sign-Protocol/attestation.mjs";

// Import functions for notifications
import {
  initializeXMTPClient,
  sendXMTPNotification,
} from "../Sign-Protocol/notification.mjs";

type Section = "Expenses" | "Balances" | "Users" | "Debts";

interface GroupData {
  id: number;
  name: string;
  description?: string;
  members: string[];
  expenseIds: number[];
}

interface Expense {
  id: number;
  payer: string;
  amount: string; // Amount in ETH as a string
  description: string;
  participants: string[]; // Ethereum addresses
  isSettled: boolean;
}

interface Debt {
  debtor: string;
  creditor: string;
  amount: string; // Amount in ETH as a string
}

const Group: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [activeSection, setActiveSection] = useState<Section>("Expenses");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for creating expenses
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newExpense, setNewExpense] = useState({
    amountEther: "",
    description: "",
    participants: "",
    sharesEther: "",
  });
  const [creationError, setCreationError] = useState<string | null>(null);
  const [creationLoading, setCreationLoading] = useState<boolean>(false);

  // State for repaying debts
  const [isRepaying, setIsRepaying] = useState<boolean>(false);
  const [repayDetails, setRepayDetails] = useState({
    creditor: "",
    amountEther: "",
  });
  const [repayError, setRepayError] = useState<string | null>(null);
  const [repayLoading, setRepayLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!contract) {
        setError("Contract not available.");
        setLoading(false);
        return;
      }

      if (!id) {
        setError("Group ID not provided.");
        setLoading(false);
        return;
      }

      const groupId = parseInt(id, 10);
      if (isNaN(groupId)) {
        setError("Invalid group ID.");
        setLoading(false);
        return;
      }

      try {
        const fetchedGroup = await getGroup(contract, groupId);
        if (fetchedGroup) {
          setGroup(fetchedGroup);

          // Fetch group expenses
          const fetchedExpensesRaw = await getGroupExpenses(contract, groupId);

          console.log("Fetched expenses:", fetchedExpensesRaw); // Debug log

          // Map fetched expenses to the Expense interface
          const fetchedExpenses: Expense[] = fetchedExpensesRaw.map(
            (expense: any) => ({
              id: expense.id,
              payer: expense.payer,
              amount: expense.amount, // Already in ETH as a string
              description: expense.description,
              participants: expense.participants,
              isSettled: expense.isSettled,
            })
          );

          console.log("Mapped expenses:", fetchedExpenses); // Debug log

          setExpenses(fetchedExpenses);

          // Fetch debts between individuals
          const fetchedDebts: Debt[] = await getUserDebts(contract, fetchedGroup.members);
          setDebts(fetchedDebts);
        } else {
          setError("Group not found.");
        }
      } catch (err) {
        setError("Error fetching group or expenses.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [id]);

  // Handlers to open/close the create expense form
  const handleOpenCreate = () => {
    setIsCreating(true);
    setCreationError(null);
    setNewExpense({
      amountEther: "",
      description: "",
      participants: "",
      sharesEther: "",
    });
  };

  const handleCloseCreate = () => {
    setIsCreating(false);
    setCreationError(null);
  };

  // Handler for form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewExpense({
      ...newExpense,
      [e.target.name]: e.target.value,
    });
  };

  // Function to create an expense
  const createExpense = async (
    contract: any,
    groupId: number,
    amountEther: string,
    description: string,
    participants: string[],
    sharesEther: string[]
  ): Promise<number | null> => {
    try {
      const amount = ethers.utils.parseEther(amountEther); // Convert ETH to wei (BigNumber)
      const shares = sharesEther.map((share) =>
        ethers.utils.parseEther(share)
      ); // Convert shares to wei (BigNumber)

      // Use BigNumber for totalShares
      let totalShares = ethers.BigNumber.from(0);
      for (const share of shares) {
        totalShares = totalShares.add(share);
      }

      if (!totalShares.eq(amount)) {
        throw new Error(
          "The sum of shares does not match the total amount."
        );
      }

      const tx = await contract.createExpense(
        amount, // _amount
        description, // _description
        participants, // _participants
        shares, // _shares
        groupId // _groupId
      );
      console.log("Expense creation transaction sent. Hash:", tx.hash);

      const receipt = await tx.wait();
      console.log("Expense created in block:", receipt.blockNumber);

      // Extract the ExpenseCreated event
      let expenseId: number | null = null;
      for (const log of receipt.logs) {
        try {
          const parsedLog = contract.interface.parseLog(log);
          if (parsedLog.name === "ExpenseCreated") {
            expenseId = Number(parsedLog.args.id);
            console.log(`Created expense ID: ${expenseId}`);
            break;
          }
        } catch (e) {
          // Ignore logs not from our contract
        }
      }

      if (expenseId === null) {
        throw new Error("ExpenseCreated event not found.");
      }

      return expenseId;
    } catch (error) {
      console.error("Error creating expense:", error);
      return null;
    }
  };

  // Handler to create an expense
  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreationLoading(true);
    setCreationError(null);

    const { amountEther, description, participants, sharesEther } = newExpense;

    // Basic validation
    if (!amountEther || !description || !participants || !sharesEther) {
      setCreationError("All fields are required.");
      setCreationLoading(false);
      return;
    }

    // Parse participants and shares
    const participantsArray = participants.split(",").map((p) => p.trim());
    const sharesArray = sharesEther.split(",").map((s) => s.trim());

    if (participantsArray.length !== sharesArray.length) {
      setCreationError("Number of participants and shares must match.");
      setCreationLoading(false);
      return;
    }

    // Validate each participant address
    const invalidAddresses = participantsArray.filter(
      (address) => !ethers.utils.isAddress(address)
    );

    if (invalidAddresses.length > 0) {
      setCreationError(
        `Invalid Ethereum address(es): ${invalidAddresses.join(", ")}`
      );
      setCreationLoading(false);
      return;
    }

    // Validate that shares are numeric and positive
    const invalidShares = sharesArray.filter(
      (share) => isNaN(Number(share)) || Number(share) <= 0
    );
    if (invalidShares.length > 0) {
      setCreationError(
        `Invalid share value(s): ${invalidShares.join(", ")}`
      );
      setCreationLoading(false);
      return;
    }

    // Validate that the amount is numeric and positive
    if (isNaN(Number(amountEther)) || Number(amountEther) <= 0) {
      setCreationError("Amount must be a positive number.");
      setCreationLoading(false);
      return;
    }

    try {
      const groupId = group!.id;
      const expenseId = await createExpense(
        contract,
        groupId,
        amountEther,
        description,
        participantsArray,
        sharesArray
      );

      if (expenseId !== null) {
        // **Attestation Process**

        // Ensure the schema exists and is stored on the blockchain
        const schemaId = await ensureSchema();

        // Initialize ethers provider and signer
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const provider = new ethers.providers.Web3Provider(
            (window as any).ethereum
          );
          await provider.send("eth_requestAccounts", []); // Request access
          const signer = provider.getSigner();
          const payerAddress = await signer.getAddress();

          // Prepare data for attestation
          const amountWei = ethers.utils.parseEther(amountEther).toString();
          const sharesWei = sharesArray.map((share) =>
            ethers.utils.parseEther(share).toString()
          );

          // Create attestation
          const attestation = await createAttestation(
            expenseId,
            payerAddress,
            amountWei,
            description,
            participantsArray,
            sharesWei,
            groupId
          );

          if (attestation && attestation.attestationId) {
            // Update expense with attestation details on the blockchain
            await updateExpenseWithAttestation(
              expenseId,
              attestation.attestationId,
              schemaId,
              attestation.indexingValue
            );

            // **Initialize XMTP client**
            const xmtpClient = await initializeXMTPClient();

            // **Prepare attestation data to send**
            const attestationData = {
              id: attestation.attestationId,
              payer: payerAddress,
              amount: amountEther,
              groupId: groupId,
              description: description,
              participants: participantsArray,
              shares: sharesArray,
              isSettled: false,
            };

            const messageContent = `New expense created:
ID: ${attestationData.id}
Payer: ${attestationData.payer}
Amount: ${attestationData.amount} ETH
Description: ${attestationData.description}
Participants: ${attestationData.participants.join(", ")}
Shares: ${attestationData.shares.join(", ")} ETH
Group ID: ${attestationData.groupId}`;

            // **Send notification to each participant**
            for (const participant of attestationData.participants) {
              // Exclude payer if they are also a participant
              if (
                participant.toLowerCase() !== attestationData.payer.toLowerCase()
              ) {
                await sendXMTPNotification(
                  xmtpClient,
                  participant,
                  messageContent
                );
              }
            }

            // **Refresh expense list and notify the user**
            const fetchedExpensesRaw = await getGroupExpenses(contract, groupId);

            const fetchedExpenses: Expense[] = fetchedExpensesRaw.map(
              (expense: any) => ({
                id: expense.id,
                payer: expense.payer,
                amount: expense.amount, // Already in ETH as a string
                description: expense.description,
                participants: expense.participants,
                isSettled: expense.isSettled,
              })
            );

            setExpenses(fetchedExpenses);
            setIsCreating(false);
            alert(
              "Expense and attestation created successfully, notifications sent!"
            );
          } else {
            setCreationError("Failed to create attestation.");
          }
        } else {
          setCreationError(
            "Ethereum provider not found. Please install MetaMask or another Ethereum wallet."
          );
          setCreationLoading(false);
          return;
        }
      } else {
        setCreationError("Failed to create expense.");
      }
    } catch (err) {
      setCreationError("An error occurred while creating the expense.");
      console.error(err);
    } finally {
      setCreationLoading(false);
    }
  };

  // Handler to open/close the repay debt form
  const handleOpenRepay = () => {
    setIsRepaying(true);
    setRepayError(null);
    setRepayDetails({
      creditor: "",
      amountEther: "",
    });
  };

  const handleCloseRepay = () => {
    setIsRepaying(false);
    setRepayError(null);
  };

  // Handler for repay form input changes
  const handleRepayInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRepayDetails({
      ...repayDetails,
      [e.target.name]: e.target.value,
    });
  };

  // Handler to repay a debt
  const handleRepayDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepayLoading(true);
    setRepayError(null);

    const { creditor, amountEther } = repayDetails;

    // Validate inputs
    if (!creditor || !amountEther) {
      setRepayError("All fields are required.");
      setRepayLoading(false);
      return;
    }

    if (!ethers.utils.isAddress(creditor)) {
      setRepayError("Invalid creditor Ethereum address.");
      setRepayLoading(false);
      return;
    }

    if (isNaN(Number(amountEther)) || Number(amountEther) <= 0) {
      setRepayError("Amount must be a positive number.");
      setRepayLoading(false);
      return;
    }

    try {
      // Repay the debt
      const tx = await repayDebt(contract, creditor, amountEther);
      if (tx) {
        // Refresh debts
        const fetchedDebts: Debt[] = await getUserDebts(contract, group!.members);
        setDebts(fetchedDebts);
        setIsRepaying(false);
        alert("Debt repaid successfully!");
      } else {
        setRepayError("Failed to repay debt.");
      }
    } catch (err) {
      setRepayError("An error occurred while repaying the debt.");
      console.error(err);
    } finally {
      setRepayLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <h2 className="text-2xl font-semibold">Loading group...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-red-500 mb-4">
          {error}
        </h2>
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Group Title and Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{group!.name}</h1>
        {group!.description && (
          <p className="text-gray-600">{group!.description}</p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          {(["Expenses", "Balances", "Users", "Debts"] as Section[]).map(
            (section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {section}
              </button>
            )
          )}
        </nav>
      </div>

      {/* Content for Active Section */}
      <div className="mb-8">
        {activeSection === "Expenses" && (
          <div className="space-y-6">
            {/* Button to Open Create Expense Form */}
            <div className="flex justify-end">
              <button
                onClick={handleOpenCreate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add New Expense
              </button>
            </div>

            {/* Modal for Create Expense Form */}
            {isCreating && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-2xl font-semibold mb-4">
                    Create New Expense
                  </h2>
                  {creationError && (
                    <p className="text-red-500 mb-2">{creationError}</p>
                  )}
                  <form
                    onSubmit={handleCreateExpense}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Amount (ETH)
                      </label>
                      <input
                        type="text"
                        name="amountEther"
                        value={newExpense.amountEther}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="e.g., 1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={newExpense.description}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="Expense description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Participant Addresses (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="participants"
                        value={newExpense.participants}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="e.g., 0x123..., 0xabc..., 0x456..."
                      />
                      <small className="text-gray-500">
                        Enter valid Ethereum addresses separated by commas.
                      </small>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Shares (ETH, comma-separated)
                      </label>
                      <input
                        type="text"
                        name="sharesEther"
                        value={newExpense.sharesEther}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="e.g., 0.5, 0.5, 0.5"
                      />
                      <small className="text-gray-500">
                        The sum of shares must equal the total amount.
                      </small>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={handleCloseCreate}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creationLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {creationLoading ? "Creating..." : "Create Expense"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List of Expenses */}
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white shadow-md rounded-lg p-6"
                >
                  <h3 className="text-2xl font-semibold mb-2">
                    Expense #{expense.id}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <span className="font-medium">Payer:</span>{" "}
                      {expense.payer}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Amount:</span>{" "}
                      {expense.amount} ETH
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Description:</span>{" "}
                      {expense.description}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Participants:</span>{" "}
                      {expense.participants.join(", ")}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Settled:</span>{" "}
                      {expense.isSettled ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No expenses for this group.</p>
            )}
          </div>
        )}
        {activeSection === "Balances" && <Balances />}
        {activeSection === "Users" && <Users />}
        {activeSection === "Debts" && (
          <div className="space-y-6">
            {/* Button to Open Repay Debt Form */}
            <div className="flex justify-end">
              <button
                onClick={handleOpenRepay}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Repay Debt
              </button>
            </div>

            {/* Modal for Repay Debt Form */}
            {isRepaying && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-2xl font-semibold mb-4">
                    Repay Debt
                  </h2>
                  {repayError && (
                    <p className="text-red-500 mb-2">{repayError}</p>
                  )}
                  <form onSubmit={handleRepayDebt} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Creditor Address
                      </label>
                      <input
                        type="text"
                        name="creditor"
                        value={repayDetails.creditor}
                        onChange={handleRepayInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="e.g., 0xabc..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Amount to Repay (ETH)
                      </label>
                      <input
                        type="text"
                        name="amountEther"
                        value={repayDetails.amountEther}
                        onChange={handleRepayInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="e.g., 0.5"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={handleCloseRepay}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={repayLoading}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        {repayLoading ? "Processing..." : "Repay Debt"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* List of Debts */}
            {debts.length > 0 ? (
              debts.map((debt, index) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-lg p-6"
                >
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <span className="font-medium">Debtor:</span>{" "}
                      {debt.debtor}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Creditor:</span>{" "}
                      {debt.creditor}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Amount:</span>{" "}
                      {debt.amount} ETH
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No debts between individuals.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Group;
