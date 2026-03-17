import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, CheckCircle, Circle, Clock, Edit2, Trash2, Repeat } from 'lucide-react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const FarmTaskManager = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [newTask, setNewTask] = useState({ title: '', time: '', frequency: 'daily', customDays: 3 });
    const [tasks, setTasks] = useState([]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today - current) / (1000 * 60 * 60 * 24));

    // 1. Fetch Tasks from Firebase in real-time
    useEffect(() => {
        if (!user?.uid) return;

        const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(fetchedTasks);
        });

        return () => unsubscribe();
    }, [user]);

    const changeDate = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        newDate.setHours(0,0,0,0);
        const dayDifference = Math.round((today - newDate) / (1000 * 60 * 60 * 24));
        if (dayDifference >= 0 && dayDifference <= 7) setCurrentDate(newDate);
    };

    const getFormatDate = () => {
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        return currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const isTaskActiveOnDate = (task, targetDate) => {
        const start = new Date(task.startDate);
        start.setHours(0,0,0,0);
        const target = new Date(targetDate);
        target.setHours(0,0,0,0);

        const daysSinceStart = Math.round((target - start) / (1000 * 60 * 60 * 24));
        if (daysSinceStart < 0) return false;

        if (task.frequency === 'daily') return true;
        if (task.frequency === 'weekly') return daysSinceStart % 7 === 0;
        if (task.frequency === 'custom') return daysSinceStart % (task.customDays || 1) === 0;
        if (task.frequency === 'once') return daysSinceStart === 0;

        return false;
    };

    const currentTasks = tasks.filter(t => isTaskActiveOnDate(t, currentDate));
    const dateStrKey = currentDate.toDateString();

    // 2. Update Task Status in Firebase
    const toggleTask = async (task) => {
        const isCompleted = task.completedDates.includes(dateStrKey);
        const newCompletedDates = isCompleted
            ? task.completedDates.filter(d => d !== dateStrKey)
            : [...task.completedDates, dateStrKey];

        try {
            await updateDoc(doc(db, 'tasks', task.id), {
                completedDates: newCompletedDates
            });
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    // 3. Save New or Edited Task to Firebase
    const handleSaveTask = async (e) => {
        e.preventDefault();
        if (!newTask.title || !newTask.time || !user?.uid) return;

        try {
            const taskData = {
                userId: user.uid,
                title: newTask.title,
                time: newTask.time,
                frequency: newTask.frequency,
                customDays: newTask.frequency === 'custom' ? newTask.customDays : null,
            };

            if (editingId) {
                // Update existing
                await updateDoc(doc(db, 'tasks', editingId), taskData);
            } else {
                // Create new
                await addDoc(collection(db, 'tasks'), {
                    ...taskData,
                    startDate: currentDate.toDateString(),
                    completedDates: []
                });
            }

            setNewTask({ title: '', time: '', frequency: 'daily', customDays: 3 });
            setShowAddForm(false);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving task:", error);
        }
    };

    const editTask = (task) => {
        setNewTask({ title: task.title, time: task.time, frequency: task.frequency, customDays: task.customDays || 3 });
        setEditingId(task.id);
        setShowAddForm(true);
    };

    // 4. Delete Task from Firebase
    const deleteTask = async (id) => {
        try {
            await deleteDoc(doc(db, 'tasks', id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    // 5. Background Tracker for Global Notifications
    useEffect(() => {
        const checkTime = setInterval(() => {
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const todayStr = today.toDateString();

            tasks.filter(t => isTaskActiveOnDate(t, now)).forEach(task => {
                if (!task.completedDates.includes(todayStr)) {
                    // 5 mins warning
                    const [tHours, tMinutes] = task.time.split(':').map(Number);
                    if ((tHours * 60 + tMinutes) - (currentHours * 60 + currentMinutes) === 5) {
                        addNotification("Task Upcoming", `In 5 minutes: ${task.title}`, "info");
                    }
                    // 10 PM missed warning
                    if (currentHours === 22 && currentMinutes === 0) {
                        addNotification("Task Missed", `You forgot to complete: ${task.title}`, "alert");
                    }
                }
            });
        }, 60000);
        return () => clearInterval(checkTime);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]);

    const getFrequencyLabel = (task) => {
        if (task.frequency === 'custom') return `EVERY ${task.customDays} DAYS`;
        return task.frequency.toUpperCase();
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-emerald-900/5 border border-emerald-50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-emerald-950">
                    <Calendar size={20} className="text-emerald-500" />
                    <h3 className="font-black text-lg">Task Manager</h3>
                </div>
                <button
                    onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); setNewTask({title:'', time:'', frequency:'daily', customDays: 3}); }}
                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                    <Plus size={18} strokeWidth={3} />
                </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-2 mb-4 border border-gray-100">
                <button onClick={() => changeDate(-1)} disabled={diffDays >= 7} className="p-1 text-gray-500 hover:text-emerald-600 disabled:opacity-30"><ChevronLeft size={20} /></button>
                <span className="font-bold text-sm text-emerald-900">{getFormatDate()}</span>
                <button onClick={() => changeDate(1)} disabled={diffDays <= 0} className="p-1 text-gray-500 hover:text-emerald-600 disabled:opacity-30"><ChevronRight size={20} /></button>
            </div>

            {showAddForm && (
                <form onSubmit={handleSaveTask} className="mb-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3">
                    <input type="text" placeholder="Task name..." className="w-full px-3 py-2 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none text-sm font-medium" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
                    <div className="flex gap-2">
                        <input type="time" className="flex-1 px-3 py-2 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none text-sm" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} required />
                        <select className="flex-1 px-3 py-2 rounded-xl border border-emerald-200 focus:border-emerald-500 outline-none text-sm bg-white" value={newTask.frequency} onChange={e => setNewTask({...newTask, frequency: e.target.value})}>
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="custom">Custom Days</option>
                        </select>
                    </div>

                    {newTask.frequency === 'custom' && (
                        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-emerald-200">
                            <Repeat size={16} className="text-emerald-500 ml-1" />
                            <span className="text-sm font-bold text-emerald-900">Repeat every:</span>
                            <input type="number" min="2" max="365" className="w-16 px-2 py-1 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm font-bold text-center" value={newTask.customDays} onChange={e => setNewTask({...newTask, customDays: parseInt(e.target.value) || 2})} required />
                            <span className="text-sm font-bold text-emerald-900">days</span>
                        </div>
                    )}

                    <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-2 rounded-xl hover:bg-emerald-600 text-sm mt-1">
                        {editingId ? 'Update Task' : 'Save Task'}
                    </button>
                </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {currentTasks.length === 0 ? (
                    <p className="text-center text-sm font-medium text-gray-400 mt-8">No tasks for this day.</p>
                ) : (
                    currentTasks.sort((a,b) => a.time.localeCompare(b.time)).map((task) => {
                        const isCompleted = task.completedDates && task.completedDates.includes(dateStrKey);
                        return (
                            <div key={task.id} className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${isCompleted ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-900/5'}`}>
                                <div className="mt-1 cursor-pointer transition-transform active:scale-90" onClick={() => toggleTask(task)}>
                                    {isCompleted ? <CheckCircle size={20} className="text-emerald-500" /> : <Circle size={20} className="text-gray-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm truncate ${isCompleted ? 'text-gray-500 line-through' : 'text-emerald-950'}`}>{task.title}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                    <span className={`flex items-center text-xs font-bold ${isCompleted ? 'text-gray-400' : 'text-emerald-600'}`}>
                      <Clock size={12} className="mr-1" />{task.time}
                    </span>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                      {getFrequencyLabel(task)}
                    </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => editTask(task)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"><Edit2 size={14}/></button>
                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default FarmTaskManager;