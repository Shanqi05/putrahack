import React, { useState, useEffect } from "react";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    CheckCircle,
    Circle,
    Clock,
    Edit2,
    Trash2,
    Repeat,
} from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../context/AuthContext";
import { useNotification } from "../../context/NotificationContext";

const FarmTaskManager = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();

    const [tasks, setTasks] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newTask, setNewTask] = useState({ title: "", time: "", frequency: "daily", customDays: 3 });
    const [notifiedTasks, setNotifiedTasks] = useState(new Set());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const current = new Date(currentDate);
    current.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

    const getActiveUserId = () => {
        if (!user) return null;
        return user.uid || user.id || user._id || user.email || "unknown_user";
    };

    // 1. Fetch Tasks from Firebase in real-time
    useEffect(() => {
        const activeUserId = getActiveUserId();
        if (!activeUserId) return;

        const q = query(collection(db, "tasks"), where("userId", "==", activeUserId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setTasks(fetchedTasks);
        });

        return () => unsubscribe();
    }, [user]);

    //  2. Global Notification Tracker: 5 Minutes Before Task Starts
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const todayStr = now.toDateString();

            tasks.forEach(task => {
                if (!task.time) return;

                if (isTaskActiveOnDate(task, now) && (!task.completedDates || !task.completedDates.includes(todayStr))) {
                    const [tHours, tMinutes] = task.time.split(":").map(Number);
                    const taskTotalMinutes = tHours * 60 + tMinutes;
                    const currentTotalMinutes = currentHours * 60 + currentMinutes;

                    const timeDiff = taskTotalMinutes - currentTotalMinutes;

                    const upcomingKey = `notified_upcoming_${task.id}_${todayStr}`;
                    const nowKey = `notified_now_${task.id}_${todayStr}`;

                    // Before 1-5 min task start
                    if (timeDiff > 0 && timeDiff <= 5 && !localStorage.getItem(upcomingKey)) {

                        addNotification(`Starts in ${timeDiff} min`, task.title, "alert");
                        localStorage.setItem(upcomingKey, 'true');
                    }

                    // 2. task started
                    if (timeDiff === 0 && !localStorage.getItem(nowKey)) {
                        addNotification("Task Started! 🚀", task.title, "success");
                        localStorage.setItem(nowKey, 'true');
                    }
                }
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [tasks, addNotification]);

    const changeDate = (days) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        newDate.setHours(0, 0, 0, 0);
        const dayDifference = Math.round((today.getTime() - newDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDifference >= 0 && dayDifference <= 7) setCurrentDate(newDate);
    };

    const getFormatDate = () => {
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        return currentDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    };

    const isTaskActiveOnDate = (task, targetDate) => {
        if (!task.startDate) return false;
        const start = new Date(task.startDate);
        start.setHours(0, 0, 0, 0);
        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);

        const daysSinceStart = Math.round((target.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceStart < 0) return false;

        if (task.frequency === "daily") return true;
        if (task.frequency === "weekly") return daysSinceStart % 7 === 0;
        if (task.frequency === "custom") return daysSinceStart % (task.customDays || 1) === 0;
        if (task.frequency === "once") return daysSinceStart === 0;

        return false;
    };

    const currentTasks = tasks.filter((t) => isTaskActiveOnDate(t, currentDate));
    const dateStrKey = currentDate.toDateString();

    const toggleTask = async (task) => {
        const isCompleted = task.completedDates && task.completedDates.includes(dateStrKey);
        const newCompletedDates = isCompleted
            ? (task.completedDates || []).filter((d) => d !== dateStrKey)
            : [...(task.completedDates || []), dateStrKey];

        try {
            await updateDoc(doc(db, "tasks", task.id), {
                completedDates: newCompletedDates,
            });
            if (!isCompleted) {
                addNotification("Task Completed", "Great job! Keep it up.", "success");
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("Error: You must be logged in to save a task!");
            return;
        }

        if (!newTask.title || !newTask.time) {
            alert("Please enter task name and time!");
            return;
        }

        try {
            const activeUserId = getActiveUserId();
            const taskData = {
                userId: activeUserId,
                title: newTask.title,
                time: newTask.time,
                frequency: newTask.frequency,
                customDays: newTask.frequency === "custom" ? newTask.customDays : null,
            };

            if (editingId) {
                await updateDoc(doc(db, "tasks", editingId), taskData);
                addNotification("Task Updated", "Your schedule has been modified.", "success");
            } else {
                await addDoc(collection(db, "tasks"), {
                    ...taskData,
                    startDate: currentDate.toDateString(),
                    completedDates: [],
                });
                addNotification("Task Added", `${newTask.title} scheduled.`, "success");
            }

            setNewTask({ title: "", time: "", frequency: "daily", customDays: 3 });
            setShowAddForm(false);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save task: " + error.message);
        }
    };

    const editTask = (task) => {
        setNewTask({ title: task.title, time: task.time, frequency: task.frequency, customDays: task.customDays || 3 });
        setEditingId(task.id);
        setShowAddForm(true);
    };

    const deleteTask = async (id) => {
        try {
            await deleteDoc(doc(db, "tasks", id));
            addNotification("Task Removed", "Task deleted from schedule.", "info");
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const getFrequencyLabel = (task) => {
        if (task.frequency === "custom") return `EVERY ${task.customDays} DAYS`;
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
                    onClick={() => {
                        setShowAddForm(!showAddForm);
                        setEditingId(null);
                        setNewTask({ title: "", time: "", frequency: "daily", customDays: 3 });
                    }}
                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-full hover:bg-emerald-200 transition-colors shadow-sm"
                >
                    <Plus size={18} strokeWidth={3} />
                </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 rounded-full p-2 mb-4 border border-gray-100">
                <button
                    onClick={() => changeDate(-1)}
                    disabled={diffDays >= 7}
                    className="p-1 text-gray-500 hover:text-emerald-600 disabled:opacity-30"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-sm text-emerald-900">{getFormatDate()}</span>
                <button
                    onClick={() => changeDate(1)}
                    disabled={diffDays <= 0}
                    className="p-1 text-gray-500 hover:text-emerald-600 disabled:opacity-30"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {showAddForm && (
                <form
                    onSubmit={handleSaveTask}
                    className="mb-4 bg-emerald-50/50 p-4 rounded-3xl border border-emerald-100 space-y-3"
                >
                    <input
                        type="text"
                        placeholder="Task name..."
                        className="w-full px-4 py-2 rounded-full border border-emerald-200 focus:border-emerald-500 outline-none text-sm font-medium shadow-sm"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        required
                    />
                    <div className="flex gap-2">
                        <input
                            type="time"
                            className="flex-1 px-4 py-2 rounded-full border border-emerald-200 focus:border-emerald-500 outline-none text-sm shadow-sm"
                            value={newTask.time}
                            onChange={(e) => setNewTask({ ...newTask, time: e.target.value })}
                            required
                        />
                        <select
                            className="flex-1 px-4 py-2 rounded-full border border-emerald-200 focus:border-emerald-500 outline-none text-sm bg-white shadow-sm"
                            value={newTask.frequency}
                            onChange={(e) => setNewTask({ ...newTask, frequency: e.target.value })}
                        >
                            <option value="once">Once</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="custom">Custom Days</option>
                        </select>
                    </div>

                    {newTask.frequency === "custom" && (
                        <div className="flex items-center gap-3 bg-white p-2 rounded-full border border-emerald-200 shadow-sm pl-4">
                            <Repeat size={16} className="text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-900">Repeat every:</span>
                            <input
                                type="number"
                                min="2"
                                max="365"
                                className="w-16 px-2 py-1 rounded-lg border border-gray-200 focus:border-emerald-500 outline-none text-sm font-bold text-center"
                                value={newTask.customDays}
                                onChange={(e) => setNewTask({ ...newTask, customDays: parseInt(e.target.value) || 2 })}
                                required
                            />
                            <span className="text-sm font-bold text-emerald-900 pr-2">days</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-full hover:bg-emerald-600 text-sm mt-2 shadow-md hover:shadow-lg transition-all"
                    >
                        {editingId ? "Update Task" : "Save Task"}
                    </button>
                </form>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {currentTasks.length === 0 ? (
                    <p className="text-center text-sm font-medium text-gray-400 mt-8">No tasks for this day.</p>
                ) : (
                    currentTasks
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((task) => {
                            const isCompleted = task.completedDates && task.completedDates.includes(dateStrKey);
                            return (
                                <div
                                    key={task.id}
                                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${isCompleted ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md"}`}
                                >
                                    <div
                                        className="mt-1 cursor-pointer transition-transform active:scale-90"
                                        onClick={() => toggleTask(task)}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle size={20} className="text-emerald-500" />
                                        ) : (
                                            <Circle size={20} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-bold text-sm truncate ${isCompleted ? "text-gray-500 line-through" : "text-emerald-950"}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                          <span className={`flex items-center text-xs font-bold ${isCompleted ? "text-gray-400" : "text-emerald-600"}`}>
                                            <Clock size={12} className="mr-1" />
                                              {task.time}
                                          </span>
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                                            {getFrequencyLabel(task)}
                                          </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => editTask(task)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => deleteTask(task.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                            <Trash2 size={14} />
                                        </button>
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