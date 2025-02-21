import React, { useContext, useEffect, useState, MouseEvent } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { AuthContext } from '../context/AuthContext';
import useWebSocket from 'react-use-websocket';
import { useRouter } from 'next/router';
import ChatInterface from '../components/ChatInterface';
import TaskList from '../components/TaskList';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';

// Updated type to account for possible null dates in range selection
type CalendarValue = Date | [Date | null, Date | null] | null;

const Dashboard: React.FC = () => {
  const { token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<any>(null);

  // For date selection on the calendar
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // NEW: AI prompt state
  const [aiPrompt, setAiPrompt] = useState('');

  // WebSocket
  const { lastJsonMessage } = useWebSocket(
    `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') || 'ws://localhost:3000'}/ws`,
    { shouldReconnect: () => true }
  );

  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  useEffect(() => {
    if (lastJsonMessage) {
      console.log('WebSocket message received:', lastJsonMessage);
      fetchTasks();
    }
  }, [lastJsonMessage]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tasks`,
        { headers: { Authorization: token } }
      );
      setTasks(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks for the selected date
  useEffect(() => {
    if (selectedDate) {
      const selectedStr = selectedDate.toDateString();
      const filtered = tasks.filter((task) => {
        if (task.DueDate) {
          const taskDate = new Date(task.DueDate).toDateString();
          return taskDate === selectedStr;
        }
        return false;
      });
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [selectedDate, tasks]);

  // Separate list of tasks that are not completed
  const notCompletedTasks = tasks.filter((t) => t.Status !== 'completed');

  // Mark calendar tiles red if there's at least one "pending" task on that date
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toDateString();
      // Get tasks for this date
      const tasksForDate = tasks.filter((task) => {
        if (task.DueDate) {
          return new Date(task.DueDate).toDateString() === dateString;
        }
        return false;
      });
      // If any task has status "pending", mark tile red
      if (tasksForDate.some((task) => task.Status === 'pending')) {
        return 'bg-red-100';
      }
    }
    return null;
  };

  // Fix: Handle Calendar onChange with proper typing
  const handleDateChange = (
    value: CalendarValue,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value)) {
      const firstDate = value[0];
      setSelectedDate(firstDate ?? null);
    } else {
      setSelectedDate(null);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tasks/${id}`,
        { headers: { Authorization: token } }
      );
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const updatedData =
        newStatus === 'completed'
          ? { Status: newStatus, Description: '' }
          : { Status: newStatus };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/tasks/${id}`,
        updatedData,
        { headers: { Authorization: token } }
      );
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleEditTask = (task: any) => {
    setEditTask(task);
  };

  // NEW: "Get AI Help" callback
  const handleAiHelp = (task: any) => {
    const dueDateText = task.DueDate
      ? `\nDue Date: ${new Date(task.DueDate).toDateString()}`
      : '';
    const promptText = `
Task Title: ${task.Title}
Task Description: ${task.Description}${dueDateText}

I need help with:
    `.trim();
    setAiPrompt(promptText);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Nav */}
      <nav className="bg-white shadow">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="container mx-auto p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Calendar & CreateTask */}
          <div className="w-full lg:w-1/3 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Calendar</h2>
            <Calendar
              onChange={handleDateChange} // Updated to use the new handler
              value={selectedDate}
              tileClassName={tileClassName}
              className="mx-auto"
            />
            {selectedDate && (
              <p className="text-center mt-2 text-gray-600">
                Selected Date: {selectedDate.toDateString()}
              </p>
            )}
            <div className="mt-6">
              <CreateTaskModal
                token={token!}
                onTaskCreated={fetchTasks}
                defaultDueDate={selectedDate ?? undefined}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {/* Not Completed Tasks */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All Not-Completed Tasks</h2>
              {notCompletedTasks.length === 0 ? (
                <p className="text-gray-600">No incomplete tasks.</p>
              ) : (
                <TaskList
                  tasks={notCompletedTasks}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onAiHelp={handleAiHelp}
                />
              )}
            </div>

            {/* Tasks for Selected Date + AI Chat */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Tasks for {selectedDate ? selectedDate.toDateString() : 'All Dates'}
              </h2>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-xl text-gray-600">Loading tasks...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-xl text-red-500">{error}</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xl text-gray-600">
                    No tasks found {selectedDate ? 'for this date' : ''}.
                  </p>
                </div>
              ) : (
                <TaskList
                  tasks={filteredTasks}
                  onDelete={handleDeleteTask}
                  onStatusChange={handleStatusChange}
                  onAiHelp={handleAiHelp}
                />
              )}
            </div>

            <div className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ask for Suggestions</h2>
              <ChatInterface initialPrompt={aiPrompt} />
            </div>
          </div>
        </div>
      </div>

      {editTask && (
        <EditTaskModal
          token={token!}
          task={editTask}
          onClose={() => setEditTask(null)}
          onTaskUpdated={fetchTasks}
        />
      )}
    </div>
  );
};

export default Dashboard;
