import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, UserCircle } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { it } from 'date-fns/locale';

export default function Header({ date, onPrevDay, onNextDay, onDateChange, currentUser, onChangeUser }) {
  const displayDate = isToday(date) 
    ? 'Oggi' 
    : format(date, 'EEEE d MMMM', { locale: it });

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex flex-col gap-3 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-2xl font-black text-orange-600 tracking-tight leading-none">
            Casa Rubino
          </h1>
          {!isToday(date) && (
            <button 
              onClick={() => onDateChange(new Date())}
              className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-lg mt-2 active:scale-95 transition-transform"
            >
              Torna a Oggi
            </button>
          )}
        </div>
        <button 
          onClick={onChangeUser}
          className="flex items-center gap-1.5 bg-black text-white px-4 py-2 rounded-full text-sm font-bold active:scale-95 transition-transform shadow-sm"
        >
          <UserCircle className="w-4 h-4" />
          {currentUser}
        </button>
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1">
        <button 
          onClick={onPrevDay}
          className="p-3 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 flex-1 justify-center">
          <CalendarIcon className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-black text-lg capitalize tracking-tight">
            {displayDate}
          </span>
          {/* Un vero selettore data potrebbe essere un input type="date" nascosto o mostrato al click */}
          <input 
            type="date" 
            className="absolute opacity-0 w-32 h-10 cursor-pointer"
            value={format(date, 'yyyy-MM-dd')}
            onChange={(e) => {
              if (e.target.value) {
                onDateChange(new Date(e.target.value));
              }
            }}
          />
        </div>

        <button 
          onClick={onNextDay}
          className="p-3 text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
