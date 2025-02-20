// components/TaskItem.tsx

import React, { useState } from 'react';

interface Task {
  ID: number;
  Title: string;
  Description: string;
  Status: string;
  DueDate?: string;
}

interface TaskItemProps {
  task: Task;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => void;
  onAiHelp: (task: Task) => void; // NEW callback for AI help
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDelete, onStatusChange, onAiHelp }) => {
  const [status, setStatus] = useState(task.Status);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onStatusChange(task.ID, newStatus);
  };

  const formattedDate = task.DueDate ? new Date(task.DueDate).toLocaleDateString() : '';

  return (
    <div className="border p-4 mb-4 rounded bg-white shadow">
      <div className="flex justify-between items-center mb-2">
        <h2
          className={`text-xl font-semibold ${
            status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'
          }`}
        >
          {task.Title}
        </h2>
        <button
          onClick={() => onDelete(task.ID)}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
        >
          Delete
        </button>
      </div>
      {formattedDate && (
        <p className="text-sm text-gray-500 mb-2">Due: {formattedDate}</p>
      )}
      {status !== 'completed' && (
        <p className="text-gray-700">{task.Description}</p>
      )}
      <div className="mt-2 flex items-center gap-4">
        <div>
          <label className="mr-2 font-medium text-gray-600">Status:</label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="p-1 border border-gray-300 rounded"
          >
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* NEW: "Get AI Help" button */}
        <button
          onClick={() => onAiHelp(task)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition"
        >
          Get AI Help
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
