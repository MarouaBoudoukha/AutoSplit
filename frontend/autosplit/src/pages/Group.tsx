// src/pages/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import { useGlobalContext } from '../context/GlobalState';
import { getAllGroups, contract} from '../utils/getExpenses.mjs';

interface Group {
  id: number;
  name: string;
  members: string[];
  expenseIds: number[];
}

const Dashboard: React.FC = () => {
  // const { contract } = useGlobalContext();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!contract) {
        setError('Contrat non disponible.');
        setLoading(false);
        return;
      }

      try {
        const fetchedGroups = await getAllGroups(contract);
        if (fetchedGroups) {
          setGroups(fetchedGroups);
        } else {
          setError('Aucun groupe trouvé.');
        }
      } catch (err) {
        setError('Erreur lors de la récupération des groupes.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [contract]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-xl">Chargement des groupes...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-xl text-red-500">{error}</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Tableau de Bord</h1>
      {groups.length === 0 ? (
        <p>Aucun groupe disponible. Créez-en un nouveau !</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li key={group.id} className="p-4 border rounded shadow">
              <h2 className="text-2xl font-semibold">{group.name}</h2>
              <p>Membres: {group.members.length}</p>
              <Link
                to={`/group/${group.id}`}
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Voir le groupe
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dashboard;
