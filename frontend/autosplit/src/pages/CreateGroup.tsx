// src/pages/CreateGroup.tsx

import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/solid';
import { toast } from 'react-toastify';
import { useGlobalContext } from '../context/GlobalState';

interface CreateGroupValues {
  name: string;
  description: string;
  members: string;
}

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const { setGroupId } = useGlobalContext(); // Assuming you have setGroupId in context

  const formik = useFormik<CreateGroupValues>({
    initialValues: {
      name: '',
      description: '',
      members: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Group Name is required'),
      description: Yup.string().required('Description is required'),
      members: Yup.string()
        .required('At least one member is required')
        .test(
          'is-valid-members',
          'Members must be comma-separated names or wallet addresses',
          (value) => {
            if (!value) return false;
            const membersArray = value.split(',').map((member) => member.trim());
            return membersArray.every((member) => member.length > 0);
          }
        ),
    }),
    onSubmit: (values) => {
      // Mock group creation logic
      console.log('Group Created:', values);
      toast.success('Group created successfully!');

      // Mock group ID generation (replace with actual logic)
      const newGroupId = Math.floor(Math.random() * 1000).toString();

      // Set the new group ID in context if necessary
      setGroupId(newGroupId);

      // Navigate to the new group's page
      navigate(`/group/${newGroupId}`);
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Create New Group</h2>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Group Name */}
        <div>
          <label htmlFor="name" className="block text-gray-700">
            Group Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter group name"
            className={`mt-1 block w-full px-3 py-2 border ${
              formik.touched.name && formik.errors.name
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.name}
          />
          {formik.touched.name && formik.errors.name ? (
            <p className="mt-2 text-sm text-red-600">{formik.errors.name}</p>
          ) : null}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Enter group description"
            className={`mt-1 block w-full px-3 py-2 border ${
              formik.touched.description && formik.errors.description
                ? 'border-red-500'
                : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            rows={4}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.description}
          ></textarea>
          {formik.touched.description && formik.errors.description ? (
            <p className="mt-2 text-sm text-red-600">
              {formik.errors.description}
            </p>
          ) : null}
        </div>

        {/* Members */}
        <div>
          <label htmlFor="members" className="block text-gray-700">
            Members (comma-separated names or wallet addresses)
          </label>
          <input
            id="members"
            name="members"
            type="text"
            placeholder="e.g., Alice, Bob, Charlie"
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
            <p className="mt-2 text-sm text-red-600">
              {formik.errors.members}
            </p>
          ) : null}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Group
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGroup;
