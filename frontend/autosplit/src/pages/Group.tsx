// src/pages/Group.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Expenses from '../components/GroupSections/Expenses';
import Balances from '../components/GroupSections/Balances';
import Users from '../components/GroupSections/Users';
import { useGlobalContext } from '../context/GlobalState';

type Section = 'Expenses' | 'Balances' | 'Users';

interface GroupData {
  id : string;
  name: string;
  description: string;
  members: string[];
}

const mockGroup: GroupData = {
  id : '1',
  name: 'Trip to Bali',
  description: 'A fun-filled trip to Bali with friends.',
  members: ['Alice', 'Bob', 'Charlie'],
};

const Group: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useGlobalContext();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('Expenses');

  useEffect(() => {
    // Mock fetching group data based on ID
    if (id === mockGroup.id) {
      setGroup(mockGroup);
    } else {
      // Handle group not found scenario
      setGroup(null);
    }
  }, [id]);

  if (!group) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-semibold">Group not found.</h2>
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          Go back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Group Title and Description */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
        <p className="text-gray-600">{group.description}</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          {(['Expenses', 'Balances', 'Users'] as Section[]).map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                activeSection === section
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {section}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Section Content */}
      <div className="mb-8">
        {activeSection === 'Expenses' && <Expenses />}
        {activeSection === 'Balances' && <Balances />}
        {activeSection === 'Users' && <Users />}
      </div>
    </div>
  );
};

export default Group;