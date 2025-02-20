// components/EditTaskModal.tsx

import React, { useState } from 'react';
import axios from 'axios';

interface EditTaskModalProps {
  token: string;
  task: any; // You can define a more specific type if desired
  onClose: () => void;
  onTaskUpdated: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ token, task, onClose, onTaskUpdated }) => {
  const [title, setTitle] = useState(task.Title);
  const [description, setDescription] = useState(task.Description);
  const [status, setStatus] = useState(task.Status);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await axios.put(
        `http://localhost:3000/api/tasks/${task.ID}`,
        { Title: title, Description: description, Status: status },
        { headers: { Authorization: token } }
      );
      onTaskUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to update task');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md w-1/2">
        <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <textarea
            placeholder="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          >
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-4">
              Cancel
            </button>
            <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
