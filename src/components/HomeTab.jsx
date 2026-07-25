import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, orderBy, deleteDoc } from 'firebase/firestore';
import { Plus, Check, Circle, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function HomeTab({ date, currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [oldUncompletedCount, setOldUncompletedCount] = useState(0);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, 'tasks'),
      where('date', '==', date)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      tasksData.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
      setTasks(tasksData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [date]);

  useEffect(() => {
    if (!db) return;
    
    // Controlla le task non completate dei giorni precedenti
    const qOld = query(
      collection(db, 'tasks'),
      where('completed', '==', false)
    );

    const unsubscribeOld = onSnapshot(qOld, (snapshot) => {
      let count = 0;
      snapshot.forEach(doc => {
        if (doc.data().date < date) {
          count++;
        }
      });
      setOldUncompletedCount(count);
    });

    return () => unsubscribeOld();
  }, [date]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !db) return;

    try {
      await addDoc(collection(db, 'tasks'), {
        title: newTaskTitle.trim(),
        completed: false,
        completedBy: null,
        addedBy: currentUser,
        date: date,
        timestamp: serverTimestamp()
      });
      setNewTaskTitle('');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const formatTaskTime = (timestamp) => {
    if (!timestamp) return 'Ora...';
    const dateObj = new Date(timestamp.toMillis());
    return format(dateObj, 'HH:mm');
  };

  const toggleTask = async (task) => {
    if (!db) return;
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        completed: !task.completed,
        completedBy: !task.completed ? currentUser : null
      });
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };

  const confirmDeleteTask = async () => {
    if (!db || !taskToDelete) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskToDelete.id));
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const todoTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="flex flex-col gap-4">
      {!db && (
        <div className="bg-orange-100 text-orange-800 p-3 rounded-lg text-sm mb-2">
          Database non collegato. Controlla il file .env.local
        </div>
      )}

      {oldUncompletedCount > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center justify-between shadow-sm mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-red-600">{oldUncompletedCount}</span>
            </div>
            <p className="text-sm font-medium">Faccende arretrate dai giorni scorsi non completate!</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input 
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Nuova faccenda..."
          className="flex-1 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 font-medium text-black placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-orange-500 focus:ring-0 text-base transition-colors"
        />
        <button 
          type="submit"
          disabled={!newTaskTitle.trim()}
          className="bg-orange-600 text-white p-3 rounded-2xl shadow-sm disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center w-14 border-2 border-orange-600 disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </form>

      {loading ? (
        <div className="text-center text-gray-500 font-medium py-8">Caricamento...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center text-gray-400 font-medium py-12 border-2 border-dashed border-gray-200 rounded-2xl">
          Nessuna faccenda per questa giornata!
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {todoTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3 px-1">
                Da svolgere ({todoTasks.length})
              </h2>
              <div className="flex flex-col gap-3">
                {todoTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task)}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm cursor-pointer transition-all active:scale-95 hover:border-orange-200 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 rounded-full border-2 border-gray-300 group-hover:border-orange-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-black break-words mb-0.5">
                        {task.title}
                      </p>
                      {task.addedBy && (
                        <p className="text-xs text-gray-500 font-medium">
                          Inserito da {task.addedBy} alle {formatTaskTime(task.timestamp)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);
                      }}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {completedTasks.length > 0 && (
            <section>
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-wider mb-3 px-1">
                Completate ({completedTasks.length})
              </h2>
              <div className="flex flex-col gap-3">
                {completedTasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task)}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-transparent cursor-pointer transition-all active:scale-95 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-400 line-through break-words mb-0.5">
                        {task.title}
                      </p>
                      {task.addedBy && (
                        <p className="text-xs text-gray-400 font-medium mb-0.5">
                          Inserito da {task.addedBy} alle {formatTaskTime(task.timestamp)}
                        </p>
                      )}
                      {task.completedBy && (
                        <p className="text-xs text-orange-600 font-bold">
                          Completato da {task.completedBy}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete(task);
                      }}
                      className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 transform scale-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Elimina faccenda</h3>
            <p className="text-center text-gray-500 mb-6 font-medium">
              Sei sicuro di voler eliminare &quot;{taskToDelete.title}&quot;? L&apos;azione non può essere annullata.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={confirmDeleteTask}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
