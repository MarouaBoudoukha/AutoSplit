// src/components/GroupSections/Expenses.tsx

import React from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGlobalContext } from './../context/GlobalState';

interface Expense {
  id: number;
  groupId: number;
  payer: string;
  amount: string;
  description: string;
  participants: string[];
  isSettled: boolean;
}

interface ExpensesProps {
  expenses: Expense[];
}

const Expenses: React.FC<ExpensesProps> = ({ expenses }) => {
  const navigate = useNavigate();
  const { groupId } = useGlobalContext();

  // Group expenses by date (assuming you have a date property)
  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = new Date().toISOString().split('T')[0]; // Replace with actual date if available
    if (!acc[date]) acc[date] = [];
    acc[date].push(expense);
    return acc;
  }, {} as { [key: string]: Expense[] });

  const handleAddExpense = () => {
    if (groupId) {
      navigate(`/add-expense/${groupId}`);
    } else {
      toast.error('Group ID is missing.');
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Total Expenses: {expenses.length}</h3>
        </div>
        <button
          onClick={handleAddExpense}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Expenses Grouped by Date */}
      {Object.keys(groupedExpenses)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .map((date) => (
          <div key={date} className="mb-8">
            <h4 className="text-md font-semibold mb-4">{new Date(date).toDateString()}</h4>
            <ul>
              {groupedExpenses[date].map((expense) => (
                <li key={expense.id} className="mb-4 p-4 bg-white rounded shadow">
                  <h5 className="text-md font-bold">{expense.description}</h5>
                  <p className="text-sm text-gray-600">Paid by: {expense.payer}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-blue-600">
                      Participants: {expense.participants.length}
                    </span>
                    <span className="text-sm font-semibold">{expense.amount} ETH</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default Expenses;
