import React, { useState, useMemo, useCallback } from 'react';
import { Task, Priority } from './types';
import { TaskCard } from './components/TaskCard';
import { generateTaskTips } from './services/geminiService';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>(Priority.MEDIUM);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Derived state for columns
  const todoTasks = useMemo(() => 
    tasks.filter(t => !t.isCompleted).sort((a, b) => {
        // Sort by deadline (nearest first), then priority
        if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        if (a.deadline) return -1;
        if (b.deadline) return 1;
        return 0;
    }), 
  [tasks]);

  const doneTasks = useMemo(() => 
    tasks.filter(t => t.isCompleted).sort((a, b) => {
        // Sort by completed at (newest first)
        return new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime();
    }), 
  [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      deadline: newTaskDeadline,
      priority: newTaskPriority,
      isCompleted: false,
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDeadline('');
    setNewTaskPriority(Priority.MEDIUM);
    setIsFormOpen(false);
  };

  const completeTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, isCompleted: true, completedAt: new Date().toISOString() } 
        : t
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleGetTips = useCallback(async (id: string, title: string) => {
     setTasks(prev => prev.map(t => t.id === id ? { ...t, isLoadingTips: true } : t));
     
     const tips = await generateTaskTips(title);
     
     setTasks(prev => prev.map(t => t.id === id ? { ...t, aiTips: tips, isLoadingTips: false } : t));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">ZenTask AI</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            {tasks.filter(t => !t.isCompleted).length} tasks remaining
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Add Task Area */}
        <div className="mb-8">
          {!isFormOpen ? (
            <button 
              onClick={() => setIsFormOpen(true)}
              className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-gray-200 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create New Task
            </button>
          ) : (
            <form onSubmit={addTask} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">New Task</h2>
                <button type="button" onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Task Description</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    autoFocus
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full rounded-lg border-gray-300 border px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white text-sm"
                  >
                    <option value={Priority.HIGH}>High</option>
                    <option value={Priority.MEDIUM}>Medium</option>
                    <option value={Priority.LOW}>Low</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button 
                   type="button" 
                   onClick={() => setIsFormOpen(false)}
                   className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Task
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Kanban Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* TODO Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                To Do
                <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full ml-2">{todoTasks.length}</span>
              </h2>
            </div>
            
            {todoTasks.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center h-48 flex flex-col items-center justify-center text-gray-400">
                 <svg className="w-10 h-10 mb-2 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
                 <p>All caught up! Add a task to get started.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {todoTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={completeTask} 
                    onDelete={deleteTask}
                    onGetTips={handleGetTips}
                  />
                ))}
              </div>
            )}
          </div>

          {/* DONE Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Done
                <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full ml-2">{doneTasks.length}</span>
              </h2>
            </div>

            {doneTasks.length === 0 ? (
              <div className="bg-gray-100 rounded-xl border border-transparent p-8 text-center h-48 flex flex-col items-center justify-center text-gray-400">
                 <p>Completed tasks will appear here.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {doneTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={completeTask} 
                    onDelete={deleteTask}
                    onGetTips={handleGetTips}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}