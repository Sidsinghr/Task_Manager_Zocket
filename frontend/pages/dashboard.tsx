import React, { useContext, useEffect, useState, MouseEvent } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar'; // Corrected import
import 'react-calendar/dist/Calendar.css';
import { AuthContext } from '../context/AuthContext';
import useWebSocket from 'react-use-websocket';
import { useRouter } from 'next/router';
import ChatInterface from '../components/ChatInterface';
import TaskList from '../components/TaskList';
import CreateTaskModal from '../components/CreateTaskModal';
import EditTaskModal from '../components/EditTaskModal';

// Define the Value type manually
type Value = Date | [Date, Date] | null;

const Dashboard: React.FC = () => {
  const { token, logout } = useContext(AuthContext);
  const [tasks, setTasks] = useState<any[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editTask, setEditTask] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');

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
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      const selectedStr = selectedDate.toDateString();
      const filtered = tasks.filter((task) => {
        if (task.DueDate) {
          return new Date(task.DueDate).toDateString() === selectedStr;
        }
        return false;
      });
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [selectedDate, tasks]);

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toDateString();
      const tasksForDate = tasks.filter((task) => {
        if (task.DueDate) {
          return new Date(task.DueDate).toDateString() === dateString;
        }
        return false;
      });
      if (tasksForDate.some((task) => task.Status === 'pending')) {
        return 'bg-red-100';
      }
    }
    return null;
  };

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value)) {
      setSelectedDate(value[0]);
    } else {
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
      <div className="container mx-auto p-6">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          className="mx-auto"
        />
      </div>
    </div>
  );
};

export default Dashboard;
