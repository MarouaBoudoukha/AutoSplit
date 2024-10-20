// src/pages/CreateGroup.tsx

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/solid';
import { toast } from 'react-toastify';
import { useGlobalContext } from '../context/GlobalState';
import { createGroup, contract } from '../utils/getExpenses.mjs';

interface CreateGroupValues {
    name: string;
    members: string;
}

const CreateGroup: React.FC = () => {
    const navigate = useNavigate();
    const { setGroupId } = useGlobalContext(); // Suppression de 'contract' si non utilisé

    const formik = useFormik<CreateGroupValues>({
        initialValues: {
            name: '',
            members: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Le nom du groupe est requis'),
            members: Yup.string()
                .required('Au moins un membre est requis')
                .test(
                    'is-valid-members',
                    'Les membres doivent être des adresses Ethereum séparées par des virgules',
                    (value) => {
                        if (!value) return false;
                        const membersArray = value.split(',').map((member) => member.trim());
                        return membersArray.every((member) => /^0x[a-fA-F0-9]{40}$/.test(member));
                    }
                ),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            // Séparer les membres en tableau d'adresses
            const membersArray = values.members.split(',').map((member) => member.trim());

            // Extraire les deux dernières adresses
            const lastTwoMembers = membersArray.slice(-2);

            // Adresse fixe
            try {
                // Appel de la fonction createGroup avec les paramètres spécifiés
                const groupId = await createGroup(contract, values.name, lastTwoMembers);
                if (groupId !== null) {
                    toast.success('Groupe créé avec succès !');
                    setGroupId(groupId); // Utilisation de la valeur réelle de groupId
                    navigate(`/group/${groupId}`);
                } else {
                    toast.error('Échec de la création du groupe.');
                }
            } catch (error) {
                console.error(error); // Pour déboguer
                toast.error('Une erreur est survenue lors de la création du groupe.');
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-semibold mb-6">Créer un Nouveau Groupe</h2>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
                {/* Nom du Groupe */}
                <div>
                    <label htmlFor="name" className="block text-gray-700">
                        Nom du Groupe
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Entrez le nom du groupe"
                        className={`mt-1 block w-full px-3 py-2 border ${
                            formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                    />
                    {formik.touched.name && formik.errors.name ? (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.name}</p>
                    ) : null}
                </div>

                {/* Membres */}
                <div>
                    <label htmlFor="members" className="block text-gray-700">
                        Membres (adresses Ethereum séparées par des virgules)
                    </label>
                    <input
                        id="members"
                        name="members"
                        type="text"
                        placeholder="ex. 0x123..., 0xabc..., 0xdef..."
                        className={`mt-1 block w-full px-3 py-2 border ${
                            formik.touched.members && formik.errors.members
                                ? 'border-red-500'
                                : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.members}
                    />
                    {formik.touched.members && formik.errors.members ? (
                        <p className="mt-2 text-sm text-red-600">{formik.errors.members}</p>
                    ) : null}
                </div>

                {/* Bouton de Soumission */}
                <div>
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Ajouter le Groupe
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGroup;
