// // src/pages/Dashboard.tsx
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useGlobalContext } from '../context/GlobalState';
// import { PlusIcon } from '@heroicons/react/solid';

// interface Group {
//   id: string;
//   name: string;
//   description: string;
// }

// const Dashboard: React.FC = () => {
//   const [groups, setGroups] = useState<Group[]>([]);
//   const { setGroupId } = useGlobalContext();

//   useEffect(() => {
//     // Mock data for groups
//     const mockGroups: Group[] = [
//       { id: '1', name: 'Trip to Bali', description: '....' },
//       { id: '2', name: 'Office Party', description: '....'},
//       { id: '3', name: 'Dinner with Friends', description: '....'},
//     ];
//     setGroups(mockGroups);
//   }, []);

//   return (
//     <div className="container mx-auto p-4">
//       <h2 className="text-2xl font-semibold mb-4">Your AutoSplits</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {groups.map((group) => (
//           <Link
//             to={`/group/${group.id}`}
//             key={group.id}
//             onClick={() => setGroupId(group.id)} // Set groupId in context
//             className="block p-6 bg-white rounded-lg shadow hover:bg-gray-100"
//           >
//             <h3 className="text-xl font-bold">{group.name}</h3>
//             <p
//               className={`mt-2 ${
//                 group.description.startsWith('-') ? 'text-red-500' : 'text-green-500'
//               }`}
//             >
//               Description: {group.description}

//             </p>
//           </Link>
//         ))}
//       </div>
//       <Link to="/create-group">
//         <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
//           <PlusIcon className="h-5 w-5 mr-2" />
//           Create New AutoSplit
//         </button>
//       </Link>
//     </div>
//   );
// };

// export default Dashboard;
export {};
