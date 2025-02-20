// components/CreateTaskModal.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CreateTaskModalProps {
  token: string;
  onTaskCreated: () => void;
  defaultDueDate?: Date; // New prop
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ token, onTaskCreated, defaultDueDate }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');

  // If a defaultDueDate is provided, auto-fill the date input
  useEffect(() => {
    if (defaultDueDate) {
      const year = defaultDueDate.getFullYear();
      const month = String(defaultDueDate.getMonth() + 1).padStart(2, '0');
      const day = String(defaultDueDate.getDate()).padStart(2, '0');
      setDueDate(`${year}-${month}-${day}`);
    }
  }, [defaultDueDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tasks`,
        { Title: title, Description: description, Status: status, DueDate: dueDate },
        { headers: { Authorization: token } }
      );
      setShowModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('pending');
      onTaskCreated();
    } catch (err) {
      console.error(err);
      setError('Failed to create task');
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-600 transition duration-200 text-white px-4 py-2 rounded mb-4"
      >
        Create New Task
      </button>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="font-medium text-gray-700">Due Date:</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 transition duration-200 text-white px-4 py-2 rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTaskModal;
