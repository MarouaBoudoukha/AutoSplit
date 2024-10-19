// src/components/GroupSections/Users.tsx
import React from 'react';

interface User {
  name: string;
  reimbursementThreshold: string;
}

const mockUsers: User[] = [
  { name: 'Alice', reimbursementThreshold: '1 ETH' },
  { name: 'Bob', reimbursementThreshold: '0.5 ETH' },
  { name: 'Charlie', reimbursementThreshold: '0.5 ETH' },
  // Add more mock users as needed
];

const Users: React.FC = () => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Group Members</h3>
      <div className="bg-white p-4 rounded shadow">
        <ul>
          {mockUsers.map(user => (
            <li key={user.name} className="flex justify-between items-center mb-2">
              <span>{user.name}</span>
              <span className="text-sm text-gray-600">Threshold: {user.reimbursementThreshold}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Users;
