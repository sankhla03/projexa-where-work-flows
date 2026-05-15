import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useAuth } from '../context/AuthContext';
import { workspaceAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { User, Plus } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data);
      setError(null);
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (error) return <div className="p-8 text-center">
    <div className="text-red-500 text-lg mb-4">Error: {error}</div>
    <button onClick={fetchWorkspaces} className="bg-blue-600 text-white px-4 py-2 rounded">Retry</button>
  </div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard</h1>
<p className="text-xl text-gray-600">Welcome back, {user?.name || 'User'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Workspaces</p>
                <p className="text-2xl font-bold text-gray-900">{workspaces.length}</p>
              </div>
            </div>
          </div>
          {/* Add more stats */}
        </div>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Workspaces</h2>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>New Workspace</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{workspaces?.data?.map((workspace) => (
              <Link
                key={workspace._id}
                to={`/workspace/${workspace._id}`}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-2">{workspace.name}</h3>
                <p className="text-gray-600 mb-4">{workspace.description || 'No description'}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{workspace.members.length} members</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

