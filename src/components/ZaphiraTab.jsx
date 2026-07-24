import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Heart, Activity, Pill, Utensils, Send, Smile, Frown, Meh, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const MOODS = [
  { id: 'bene', label: 'Sta bene', icon: Smile, color: 'bg-green-100 text-green-700 border-green-200' },
  { id: 'letargica', label: 'Letargica', icon: Meh, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'dolorante', label: 'Dolorante', icon: Frown, color: 'bg-red-100 text-red-700 border-red-200' }
];

const ACTIONS = [
  { id: 'gastro', label: 'Gastroprotettore', icon: Pill, color: 'bg-blue-100 text-blue-700' },
  { id: 'cortisone', label: 'Cortisone', icon: Pill, color: 'bg-purple-100 text-purple-700' },
  { id: 'pappa', label: 'Ha mangiato', icon: Utensils, color: 'bg-orange-100 text-orange-700' }
];

export default function ZaphiraTab({ date, currentUser }) {
  const [logs, setLogs] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [logToDelete, setLogToDelete] = useState(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    
    // Non possiamo usare orderBy('timestamp') e where('date') facilmente senza indice composto,
    // quindi carichiamo per data e ordiniamo lato client per semplicità
    const q = query(
      collection(db, 'zaphira_logs'),
      where('date', '==', date)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      logsData.sort((a, b) => {
        // Fallback per timestamp nulli durante scritture ottimistiche
        const timeA = a.timestamp?.toMillis() || Date.now();
        const timeB = b.timestamp?.toMillis() || Date.now();
        return timeB - timeA; // Dal più recente al più vecchio
      });
      
      setLogs(logsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching logs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [date]);

  const addLog = async (type, value) => {
    if (!db) return;
    try {
      await addDoc(collection(db, 'zaphira_logs'), {
        type,
        value,
        loggedBy: currentUser,
        date: date,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding log:", error);
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addLog('note', noteText.trim());
    setNoteText('');
  };

  const confirmDeleteLog = async () => {
    if (!db || !logToDelete) return;
    try {
      await deleteDoc(doc(db, 'zaphira_logs', logToDelete.id));
      setLogToDelete(null);
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const formatLogTime = (timestamp) => {
    if (!timestamp) return 'Ora...';
    const dateObj = new Date(timestamp.toMillis());
    return format(dateObj, 'HH:mm');
  };

  const getLogIcon = (log) => {
    if (log.type === 'mood') {
      const mood = MOODS.find(m => m.label === log.value);
      const Icon = mood ? mood.icon : Heart;
      return <Icon className="w-5 h-5" />;
    }
    if (log.type === 'action') {
      const action = ACTIONS.find(a => a.label === log.value);
      const Icon = action ? action.icon : Activity;
      return <Icon className="w-5 h-5" />;
    }
    return <Clock className="w-5 h-5" />;
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sezione Stato d'Animo */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" /> Come sta Zaphira?
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map(mood => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.id}
                onClick={() => addLog('mood', mood.label)}
                className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border-2 border-gray-100 active:scale-95 transition-transform hover:border-orange-200 group"
              >
                <div className={`p-2 rounded-full ${mood.color.split(' ')[0]} ${mood.color.split(' ')[1]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-gray-800 text-center leading-tight">{mood.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Sezione Tracker Rapido */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" /> Tracker Veloce
        </h2>
        <div className="flex flex-col gap-3">
          {ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => addLog('action', action.label)}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-gray-100 shadow-sm active:scale-95 transition-transform hover:border-orange-200 group"
              >
                <div className={`p-2 rounded-full ${action.color.split(' ')[0]} ${action.color.split(' ')[1]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-lg font-bold flex-1 text-left text-gray-800">{action.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Sezione Note */}
      <section>
        <form onSubmit={handleAddNote} className="flex flex-col gap-2">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Aggiungi una nota su Zaphira..."
            className="w-full bg-white border-2 border-gray-200 rounded-2xl px-4 py-3 font-medium text-black placeholder:text-gray-400 shadow-sm focus:outline-none focus:border-orange-500 focus:ring-0 text-base transition-colors min-h-[100px] resize-none"
          />
          <button 
            type="submit"
            disabled={!noteText.trim()}
            className="bg-orange-600 text-white py-3 rounded-2xl font-bold shadow-sm disabled:opacity-50 active:scale-95 transition-transform flex items-center justify-center gap-2 border-2 border-orange-600 disabled:border-gray-200 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <Send className="w-4 h-4 stroke-[3]" /> Salva Nota
          </button>
        </form>
      </section>

      {/* Storico Giornaliero */}
      <section className="mt-4 border-t pt-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Storico del Giorno</h2>
        
        {loading ? (
          <p className="text-center text-gray-500 text-sm">Caricamento...</p>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-400 text-sm italic py-4">Nessuna attività registrata per questa data.</p>
        ) : (
          <div className="flex flex-col gap-4 relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 z-0"></div>
            {logs.map((log) => (
              <div key={log.id} className="flex gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center text-gray-500 shadow-sm flex-shrink-0 mt-1">
                  {getLogIcon(log)}
                </div>
                <div className="flex-1 bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-gray-800 text-base">
                        {log.type === 'note' ? 'Nota' : log.value}
                      </span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        {formatLogTime(log.timestamp)}
                      </span>
                    </div>
                    {log.type === 'note' && (
                      <p className="text-gray-600 text-sm mb-2 break-words">{log.value}</p>
                    )}
                    <p className="text-xs text-purple-600 font-medium">
                      Registrato da {log.loggedBy}
                    </p>
                  </div>
                  <button
                    onClick={() => setLogToDelete(log)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full p-6 transform scale-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Elimina voce</h3>
            <p className="text-center text-gray-500 mb-6 font-medium">
              Sei sicuro di voler eliminare questa registrazione? L&apos;azione non può essere annullata.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setLogToDelete(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={confirmDeleteLog}
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
