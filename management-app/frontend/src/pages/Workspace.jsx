import React, { useState, useEffect } from 'react';
import Navbar from '../components/common/Navbar';
import { useParams } from 'react-router-dom';
import { workspaceAPI, projectAPI } from '../services/api';
import { ChevronLeft, Plus } from 'lucide-react';

const Workspace = () => {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);

  useEffect(() => {
    fetchWorkspace();
    fetchProjects();
  }, [id]);

  const fetchWorkspace = async () => {
    const { data } = await workspaceAPI.get(id);
    setWorkspace(data.data);
  };

  const fetchProjects = async () => {
    const { data } = await projectAPI.getAll(id);
    setProjects(data.data);
    if (data.data.length > 0) setActiveProject(data.data[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen p-6">
          <div className="flex items-center mb-8">
            <ChevronLeft className="w-6 h-6 text-gray-500 mr-2 cursor-pointer" />
            <h2 className="text-xl font-bold">{workspace?.name}</h2>
          </div>
          <div className="space-y-2">
            {projects.map((project) => (
              <button
                key={project._id}
                onClick={() => setActiveProject(project)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeProject?._id === project._id
                    ? 'bg-blue-50 border-blue-200 border text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {project.name}
              </button>
            ))}
          </div>
          <button className="w-full mt-6 bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {activeProject && (
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">{activeProject.name}</h1>
              <p className="text-gray-600 mb-8">{activeProject.description}</p>
              {/* Kanban or Task list here */}
              <KanbanBoard projectId={activeProject._id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Workspace;


