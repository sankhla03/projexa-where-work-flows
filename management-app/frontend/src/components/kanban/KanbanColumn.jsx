import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Clock, UserRound, Flag } from 'lucide-react';

const KanbanColumn = ({ task, index }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border hover:shadow-lg transition-all cursor-grab active:cursor-grabbing border-l-4 ${
            snapshot.isDragging ? 'ring-4 ring-blue-200 rotate-3' : ''
          } ${task.status === 'done' ? 'opacity-60 line-through' : ''}`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            {task.deadline && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(task.deadline)}
              </div>
            )}
          </div>
          <h4 className="font-semibold text-gray-800 mb-2 truncate">{task.title}</h4>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
          {task.assignee && (
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <UserRound className="w-4 h-4 mr-1" />
              <span>{task.assignee.name}</span>
            </div>
          )}
          <div className="flex space-x-1">
            {task.attachments?.map((att, i) => (
              <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📎
              </span>
            ))}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanColumn;

