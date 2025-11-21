import React from 'react';
import { Task, Priority } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onGetTips: (id: string, title: string) => void;
}

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const colors = {
    [Priority.HIGH]: 'bg-red-100 text-red-800 border-red-200',
    [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [Priority.LOW]: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${colors[priority]}`}>
      {priority}
    </span>
  );
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onDelete, onGetTips }) => {
  const isOverdue = !task.isCompleted && task.deadline && new Date(task.deadline) < new Date();

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return 'No deadline';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group relative ${task.isCompleted ? 'opacity-70 bg-gray-50' : ''}`}>
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1">
          <h3 className={`text-base font-semibold text-gray-800 leading-snug ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </h3>
        </div>
        <button
          onClick={() => onDelete(task.id)}
          className="text-gray-300 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-2">
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />
          {task.deadline && (
            <div className={`flex items-center text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {formatDeadline(task.deadline)} {isOverdue && '(Overdue)'}
            </div>
          )}
          {task.isCompleted && task.completedAt && (
             <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                Done: {formatDeadline(task.completedAt)}
             </div>
          )}
        </div>

        {!task.isCompleted && (
          <div className="flex items-center gap-2 ml-auto">
            {!task.aiTips && (
               <button
               onClick={() => onGetTips(task.id, task.title)}
               disabled={task.isLoadingTips}
               className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 p-1.5 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
               title="Get AI Tips"
             >
               {task.isLoadingTips ? (
                  <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
               ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
               )}
             </button>
            )}
            
            <button
              onClick={() => onComplete(task.id)}
              className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Done
            </button>
          </div>
        )}
      </div>

      {task.aiTips && (
        <div className="mt-3 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg border border-purple-100 animate-in fade-in slide-in-from-top-1">
           <div className="flex items-center gap-2 text-purple-800 text-xs font-bold mb-1">
             <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
             Gemini Tips
           </div>
           <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
             {task.aiTips}
           </div>
        </div>
      )}
    </div>
  );
};