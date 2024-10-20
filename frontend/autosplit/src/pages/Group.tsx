import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Balances from '../components/GroupSections/Balances';
import Users from '../components/GroupSections/Users';
import { getGroup, getGroupExpenses, contract } from '../utils/getExpenses.mjs';
// Supposons que vous ayez un contexte pour le contrat
// import { ContractContext } from '../context/ContractContext';

type Section = 'Expenses' | 'Balances' | 'Users';

interface GroupData {
  id: number;
  name: string;
  description?: string;
  members: string[];
  expenseIds: number[];
}

const Group: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  // const contract = useContext(ContractContext); // Récupère le contrat depuis le contexte
  const [group, setGroup] = useState<GroupData | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<Section>('Expenses');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupAndExpenses = async () => {
      if (!contract) {
        setError('Contrat non disponible.');
        setLoading(false);
        return;
      }

      if (!id) {
        setError('ID de groupe non fourni.');
        setLoading(false);
        return;
      }

      const groupId = parseInt(id, 10);
      if (isNaN(groupId)) {
        setError('ID de groupe invalide.');
        setLoading(false);
        return;
      }

      try {
        const fetchedGroup = await getGroup(contract, groupId);
        if (fetchedGroup) {
          setGroup(fetchedGroup);

          // Récupérer les dépenses du groupe
          const fetchedExpenses = await getGroupExpenses(contract, groupId);
          if (fetchedExpenses) {
            setExpenses(fetchedExpenses);
          } else {
            setError('Aucune dépense trouvée pour ce groupe.');
          }
        } else {
          setError('Groupe non trouvé.');
        }
      } catch (err) {
        setError('Erreur lors de la récupération du groupe ou des dépenses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndExpenses();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-screen">
        <h2 className="text-2xl font-semibold">Chargement du groupe...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-red-500 mb-4">{error}</h2>
        <Link to="/dashboard" className="text-blue-500 hover:underline">
          Retour au Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Titre et Description du Groupe */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{group!.name}</h1>
        {group!.description && <p className="text-gray-600">{group!.description}</p>}
      </div>

      {/* Onglets de Navigation */}
      <div className="mb-6 border-b">
        <nav className="-mb-px flex space-x-8">
          {(['Expenses', 'Balances', 'Users'] as Section[]).map((section) => (
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

      {/* Contenu de la Section Active */}
      <div className="mb-8">
        {activeSection === 'Expenses' && (
          <div className="space-y-6">
            {expenses.length > 0 ? (
              expenses.map((expense) => (
                <div key={expense.id} className="bg-white shadow-md rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-2">Dépense #{expense.id}</h3>
                  <div className="space-y-1">
                    <p className="text-gray-700">
                      <span className="font-medium">Payer :</span> {expense.payer}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Montant :</span> {expense.amount} ETH
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Description :</span> {expense.description}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Participants :</span> {expense.participants.join(', ')}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Réglée :</span> {expense.isSettled ? 'Oui' : 'Non'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600">Aucune dépense pour ce groupe.</p>
            )}
          </div>
        )}
        {activeSection === 'Balances' && <Balances />}
        {activeSection === 'Users' && <Users />}
      </div>
    </div>
  );
};

export default Group;
