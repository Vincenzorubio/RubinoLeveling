import { useState } from 'react';
import { format, addDays, subDays } from 'date-fns';
import { it } from 'date-fns/locale';
import Header from './components/Header';
import BottomTabs from './components/BottomTabs';
import HomeTab from './components/HomeTab';
import ZaphiraTab from './components/ZaphiraTab';
import UserSelector from './components/UserSelector';

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'zaphira'
  const [currentUser, setCurrentUser] = useState(null); // 'Mamma', 'Papà', etc.

  const formattedDate = format(selectedDate, 'yyyy-MM-dd');

  if (!currentUser) {
    return <UserSelector onSelectUser={setCurrentUser} />;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-lg relative">
      <Header 
        date={selectedDate} 
        onPrevDay={() => setSelectedDate(subDays(selectedDate, 1))}
        onNextDay={() => setSelectedDate(addDays(selectedDate, 1))}
        onDateChange={setSelectedDate}
        currentUser={currentUser}
        onChangeUser={() => setCurrentUser(null)}
      />

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {activeTab === 'home' && (
          <HomeTab 
            date={formattedDate} 
            currentUser={currentUser} 
          />
        )}
        
        {activeTab === 'zaphira' && (
          <ZaphiraTab 
            date={formattedDate} 
            currentUser={currentUser} 
          />
        )}
      </main>

      <BottomTabs 
        activeTab={activeTab} 
        onChangeTab={setActiveTab} 
      />
    </div>
  );
}

export default App;
