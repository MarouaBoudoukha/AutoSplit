// src/components/GroupSections/Balances.tsx
import React from 'react';
import { useGlobalContext } from '../../context/GlobalState';


interface UserBalance {
  name: string;
  balance: number; // Positive means owed, negative means owes
}

const mockBalances: UserBalance[] = [
  { name: 'Alice', balance: 2 },
  { name: 'Bob', balance: -1 },
  { name: 'Charlie', balance: -1 },
  // Add more mock balances as needed
];

const Balances: React.FC = () => {
  // Mock current user
  const { currentUser } =  useGlobalContext();
  const userBalance = mockBalances.find(user => user.name === currentUser);
  let balanceText = '';

  if (userBalance) {
    if (userBalance.balance > 0) {
      balanceText = `You are owed ${userBalance.balance} ETH`;
    } else if (userBalance.balance < 0) {
      balanceText = `You owe ${Math.abs(userBalance.balance)} ETH`;
    } else {
      balanceText = 'Your balance is settled';
    }
  } else {
    balanceText = 'Balance information not available';
  }

  return (
    <div>
      {/* Balance Header */}
      <h3 className="text-lg font-semibold mb-4">{balanceText}</h3>

      {/* Balances Overview */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="text-md font-semibold mb-4">Balances Overview</h4>
        <ul>
          {mockBalances.map(user => (
            <li key={user.name} className="flex justify-between items-center mb-2">
              <span>{user.name}</span>
              <span
                className={`font-semibold ${
                  user.balance > 0
                    ? 'text-green-500'
                    : user.balance < 0
                    ? 'text-red-500'
                    : 'text-gray-500'
                }`}
              >
                {user.balance > 0
                  ? `+${user.balance} ETH`
                  : user.balance < 0
                  ? `${user.balance} ETH`
                  : '0 ETH'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Balances;