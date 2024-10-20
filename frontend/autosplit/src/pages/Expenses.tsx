// // src/components/GroupSections/Expenses.tsx
// import React, { useEffect, useState, useContext } from 'react';
// import { PlusIcon } from '@heroicons/react/solid';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import { useGlobalContext } from '../context/GlobalState';
// import { getGroupExpenses, contract } from '../utils/getExpenses.mjs';
// // import { ContractContext } from '../../context/ContractContext';

// interface Expense {
//   id: number;
//   groupId: number;
//   payer: string;
//   amount: string;
//   description: string;
//   participants: string[];
//   isSettled: boolean;
// }

// interface ExpensesProps {
//   groupId: number;
// }

// const Expenses: React.FC<ExpensesProps> = ({ groupId }) => {
//   const navigate = useNavigate();
//   const { currentUser } = useGlobalContext();


//   const [expenses, setExpenses] = useState<Expense[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchExpenses = async () => {
//       if (!contract) {
//         setError('Contrat non disponible.');
//         setLoading(false);
//         return;
//       }

//       if (!groupId) {
//         setError('ID de groupe non fourni.');
//         setLoading(false);
//         return;
//       }

//       try {
//         const fetchedExpenses = await getGroupExpenses(contract, groupId);
//         if (fetchedExpenses) {
//           setExpenses(fetchedExpenses);
//         } else {
//           setError('Aucune dépense trouvée pour ce groupe.');
//         }
//       } catch (err) {
//         setError('Erreur lors de la récupération des dépenses.');
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExpenses();
//   }, [groupId, contract]);

//   const myExpenses = expenses.filter(expense => expense.payer === currentUser);
//   const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

//   const handleAddExpense = () => {
//     if (groupId) {
//       navigate(`/add-expense/${groupId}`);
//     } else {
//       toast.error('Group ID is missing.');
//     }
//   };

//   if (loading) {
//     return <div>Chargement des dépenses...</div>;
//   }

//   if (error) {
//     return <div>Erreur : {error}</div>;
//   }

//   return (
//     <div>
//       {/* Section d'en-tête */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h3 className="text-lg font-semibold">Mes dépenses : {myExpenses.length}</h3>
//           <h3 className="text-lg font-semibold">
//             Total des dépenses : {totalExpenses.toFixed(2)} ETH
//           </h3>
//         </div>
//         <button
//           onClick={handleAddExpense}
//           className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//         >
//           <PlusIcon className="h-5 w-5 mr-2" />
//           Ajouter une dépense
//         </button>
//       </div>

//       {/* Liste des dépenses */}
//       <div>
//         {expenses.length === 0 ? (
//           <p>Aucune dépense trouvée pour ce groupe.</p>
//         ) : (
//           <ul>
//             {expenses.map(expense => (
//               <li key={expense.id} className="mb-4 p-4 bg-white rounded shadow">
//                 <h5 className="text-md font-bold">Dépense #{expense.id}</h5>
//                 <p className="text-sm text-gray-600">{expense.description}</p>
//                 <div className="flex justify-between items-center mt-2">
//                   <span className="text-sm text-blue-600">Payé par : {expense.payer}</span>
//                   <span className="text-sm font-semibold">{expense.amount} ETH</span>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Expenses;
export{}
