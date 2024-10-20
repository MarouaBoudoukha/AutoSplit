import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Balances from "../components/GroupSections/Balances";
import Users from "../components/GroupSections/Users";
import { getGroup, getGroupExpenses, contract } from "../utils/getExpenses.mjs";
import { ethers } from "ethers"; // Ensure ethers is imported

type Section = "Expenses" | "Balances" | "Users";

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

const Group: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [group, setGroup] = useState<GroupData | null>(null);
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [activeSection, setActiveSection] = useState<Section>("Expenses");
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// State for Expense Creation
	const [isCreating, setIsCreating] = useState<boolean>(false);
	const [newExpense, setNewExpense] = useState({
		amountEther: "",
		description: "",
		participants: "",
		sharesEther: "",
	});
	const [creationError, setCreationError] = useState<string | null>(null);
	const [creationLoading, setCreationLoading] = useState<boolean>(false);

	useEffect(() => {
		const fetchGroupAndExpenses = async () => {
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

					// Fetch group's expenses
					const fetchedExpensesRaw = await getGroupExpenses(
						contract,
						groupId
					);

					console.log("Fetched Expenses:", fetchedExpensesRaw); // Debug log

					// Map fetched expenses to Expense interface
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

					console.log("Mapped Expenses:", fetchedExpenses); // Debug log

					if (fetchedExpenses.length > 0) {
						setExpenses(fetchedExpenses);
					} else {
						setError("No expenses found for this group.");
					}
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

		fetchGroupAndExpenses();
	}, [id]);

	// Handler to open the creation form
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

	// Handler to close the creation form
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

	// Expense Creation Function
	const createExpense = async (
		contract: any,
		groupId: number,
		amountEther: string,
		description: string,
		participants: string[],
		sharesEther: string[]
	): Promise<number | null> => {
		try {
			const amount = ethers.utils.parseEther(amountEther); // Converts ETH to wei (BigNumber)
			const shares = sharesEther.map((share) =>
				ethers.utils.parseEther(share)
			); // Converts shares to wei (BigNumber)

			// Use BigNumber for totalShares
			let totalShares = ethers.BigNumber.from(0);
			for (const share of shares) {
				totalShares = totalShares.add(share);
			}

			if (!totalShares.eq(amount)) {
				throw new Error(
					"The sum of shares does not equal the total amount."
				);
			}

			const tx = await contract.createExpense(
				groupId,
				amount,
				description,
				participants,
				shares
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
						console.log(`Created Expense ID: ${expenseId}`);
						break;
					}
				} catch (e) {
					// Ignore logs that are not from our contract
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

	// Handler for form submission
	const handleCreateExpense = async (e: React.FormEvent) => {
		e.preventDefault();
		setCreationLoading(true);
		setCreationError(null);

		const { amountEther, description, participants, sharesEther } =
			newExpense;

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
			setCreationError("Participants and shares count must match.");
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

		// Validate shares are numeric and positive
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

		// Validate amountEther is numeric and positive
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
				// Fetch updated expenses list
				const fetchedExpensesRaw = await getGroupExpenses(
					contract,
					groupId
				);

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
				alert("Expense created successfully!");
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
					Back to Dashboard
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
					{(["Expenses", "Balances", "Users"] as Section[]).map(
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

			{/* Active Section Content */}
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

						{/* Create Expense Form Modal */}
						{isCreating && (
							<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
								<div className="bg-white rounded-lg p-6 w-full max-w-md">
									<h2 className="text-2xl font-semibold mb-4">
										Create New Expense
									</h2>
									{creationError && (
										<p className="text-red-500 mb-2">
											{creationError}
										</p>
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
												Participant Addresses (comma
												separated)
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
												Enter valid Ethereum addresses
												separated by commas.
											</small>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700">
												Shares (ETH, comma separated)
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
												Total shares must equal the
												total amount.
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
												{creationLoading
													? "Creating..."
													: "Create Expense"}
											</button>
										</div>
									</form>
								</div>
							</div>
						)}

						{/* Expenses List */}
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
											<span className="font-medium">
												Payer:
											</span>{" "}
											{expense.payer}
										</p>
										<p className="text-gray-700">
											<span className="font-medium">
												Amount:
											</span>{" "}
											{expense.amount} ETH
										</p>
										<p className="text-gray-700">
											<span className="font-medium">
												Description:
											</span>{" "}
											{expense.description}
										</p>
										<p className="text-gray-700">
											<span className="font-medium">
												Participants:
											</span>{" "}
											{expense.participants.join(", ")}
										</p>
										<p className="text-gray-700">
											<span className="font-medium">
												Settled:
											</span>{" "}
											{expense.isSettled ? "Yes" : "No"}
										</p>
									</div>
								</div>
							))
						) : (
							<p className="text-gray-600">
								No expenses for this group.
							</p>
						)}
					</div>
				)}
				{activeSection === "Balances" && <Balances />}
				{activeSection === "Users" && <Users />}
			</div>
		</div>
	);
};

export default Group;
