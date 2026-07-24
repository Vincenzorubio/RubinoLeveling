import { Users } from 'lucide-react';

export default function UserSelector({ onSelectUser }) {
  const users = ['Emanuele', 'Emanuela', 'Marco', 'Roberta', 'Vincenzo'];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white border-2 border-gray-100 p-8 rounded-3xl shadow-sm w-full max-w-sm text-center">
        <div className="mx-auto bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 border-orange-200">
          <Users className="w-8 h-8 text-orange-600" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Chi usa l'app?</h1>
        <p className="text-gray-500 mb-8 text-sm font-medium">Seleziona il tuo nome per registrare le attività</p>
        
        <div className="flex flex-col gap-3">
          {users.map(user => (
            <button
              key={user}
              onClick={() => onSelectUser(user)}
              className="w-full py-4 px-6 bg-white border-2 border-gray-200 rounded-2xl text-lg font-bold text-gray-700 hover:border-orange-500 hover:bg-orange-50 transition-all active:scale-95"
            >
              {user}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
