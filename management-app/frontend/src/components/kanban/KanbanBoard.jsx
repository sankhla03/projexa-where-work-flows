import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, DropResult } from 'react-beautiful-dnd';
import KanbanColumn from './KanbanColumn';
import { taskAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useParams } from 'react-router-dom';

const statusOrder = ['todo', 'in-progress', 'review', 'done'];

const KanbanBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const { workspaceId } = useParams();
  const { socket } = useSocket();

  useEffect(() => {
    fetchTasks();
    if (socket) {
      socket.on('taskCreated', (task) => {
        setTasks(prev => [...prev, task]);
      });
      socket.on('taskUpdated', (task) => {
        setTasks(prev => prev.map(t => t._id === task._id ? task : t));
      });
      socket.on('taskDeleted', ({ id }) => {
        setTasks(prev => prev.filter(t => t._id !== id));
      });
    }

    return () => {
      if (socket) {
        socket.off('taskCreated');
        socket.off('taskUpdated');
        socket.off('taskDeleted');
      }
    };
  }, [projectId, socket]);

  const fetchTasks = async () => {
    const { data } = await taskAPI.getAll(workspaceId, projectId);
    setTasks(data.data);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t._id === draggableId);
    const newStatus = statusOrder[destination.droppableId];
    const newPosition = destination.index;

    // Optimistic update
    setTasks(prev => {
      const newTasks = Array.from(prev);
      const [removed] = newTasks.splice(source.index, 1);
      removed.status = newStatus;
      removed.position = newPosition;
      newTasks.splice(destination.index, 0, removed);
      return newTasks;
    });

    try {
      await taskAPI.update(workspaceId, projectId, draggableId, { status: newStatus, position: newPosition });
    } catch (error) {
      // Revert on error
      fetchTasks();
    }
  };

  const columns = statusOrder.map(status => ({
    id: status,
    title: status.toUpperCase().replace('-', ' '),
    tasks: tasks.filter(task => task.status === status)
  }));

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex space-x-6 overflow-x-auto pb-4">
        {columns.map(column => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex-shrink-0 w-80">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <h3 className="font-bold text-lg mb-4 capitalize">{column.title} ({column.tasks.length})</h3>
                  <div className="space-y-3 min-h-[200px]">
                    {column.tasks.map((task, index) => (
                      <KanbanColumn key={task._id} task={task} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;

