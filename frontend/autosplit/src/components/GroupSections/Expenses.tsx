// src/components/GroupSections/Expenses.tsx
import React from 'react';
import { PlusIcon } from '@heroicons/react/solid';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGlobalContext } from '../../context/GlobalState';

interface Expense {
  id: string;
  title: string;
  description: string;
  paidBy: string;
  amount: string;
  date: string;
}

const mockExpenses: Expense[] = [
  {
    id: 'e1',
    title: 'Hotel Booking',
    description: 'Paid by Alice',
    paidBy: 'Alice',
    amount: '3 ETH',
    date: '2024-04-10',
  },
  {
    id: 'e2',
    title: 'Flight Tickets',
    description: 'Paid by Bob',
    paidBy: 'Bob',
    amount: '2 ETH',
    date: '2024-04-12',
  },
  // Add more mock expenses as needed
];

const Expenses: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, groupId } = useGlobalContext(); // Assuming groupId is part of context

  // Filter and group expenses
  const myExpenses = mockExpenses.filter(expense => expense.paidBy === currentUser);
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  const groupedExpenses = mockExpenses.reduce((acc, expense) => {
    const date = expense.date;
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
          <h3 className="text-lg font-semibold">My Expenses: {myExpenses.length}</h3>
          <h3 className="text-lg font-semibold">Total Expenses: {totalExpenses.toFixed(2)} ETH</h3>
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
        .map(date => (
          <div key={date} className="mb-8">
            <h4 className="text-md font-semibold mb-4">{new Date(date).toDateString()}</h4>
            <ul>
              {groupedExpenses[date].map(expense => (
                <li key={expense.id} className="mb-4 p-4 bg-white rounded shadow">
                  <h5 className="text-md font-bold">{expense.title}</h5>
                  <p className="text-sm text-gray-600">{expense.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-blue-600">{expense.paidBy}</span>
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