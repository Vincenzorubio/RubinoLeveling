import { CheckSquare, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

export default function BottomTabs({ activeTab, onChangeTab }) {
  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20">
      <div className="flex justify-around p-2">
        <button
          onClick={() => onChangeTab('home')}
          className={clsx(
            "flex flex-col items-center gap-1 w-full py-2 rounded-xl transition-all",
            activeTab === 'home' 
              ? "text-orange-600 bg-orange-50" 
              : "text-gray-400 hover:bg-gray-50 active:bg-gray-100"
          )}
        >
          <CheckSquare className={clsx("w-6 h-6", activeTab === 'home' && "fill-orange-100")} />
          <span className="text-xs font-semibold">Faccende</span>
        </button>

        <button
          onClick={() => onChangeTab('zaphira')}
          className={clsx(
            "flex flex-col items-center gap-1 w-full py-2 rounded-xl transition-all",
            activeTab === 'zaphira' 
              ? "text-orange-600 bg-orange-50" 
              : "text-gray-400 hover:bg-gray-50 active:bg-gray-100"
          )}
        >
          <HeartPulse className={clsx("w-6 h-6", activeTab === 'zaphira' && "fill-orange-100")} />
          <span className="text-xs font-semibold">Zaphira</span>
        </button>
      </div>
    </nav>
  );
}
