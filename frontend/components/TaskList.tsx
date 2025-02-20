// components/TaskList.tsx

import React from 'react';
import TaskItem from './TaskItem';

interface Task {
  ID: number;
  Title: string;
  Description: string;
  Status: string;
  DueDate?: string;
}

interface TaskListProps {
  tasks: Task[];
  onDelete: (id: number) => void;
  onStatusChange: (id: number, newStatus: string) => void;
  onAiHelp: (task: Task) => void; // NEW
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onDelete, onStatusChange, onAiHelp }) => {
  return (
    <div>
      {tasks.length === 0 ? (
        <p className="text-center text-gray-600">No tasks found.</p>
      ) : (
        tasks.map((task) => (
          <TaskItem
            key={task.ID}
            task={task}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onAiHelp={onAiHelp} // Pass the callback down
          />
        ))
      )}
    </div>
  );
};

export default TaskList;
