
import React, { useState } from 'react';
import PlantIdentifier from './components/PlantIdentifier';
import ChatAssistant from './components/ChatAssistant';
import { LeafIcon } from './components/icons/LeafIcon';
import { ChatBubbleIcon } from './components/icons/ChatBubbleIcon';

type ActiveTab = 'identifier' | 'chat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('identifier');

  const tabClasses = (tabName: ActiveTab) => 
    `flex items-center justify-center w-full px-4 py-3 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
      activeTab === tabName
        ? 'bg-green-600 text-white shadow-md'
        : 'bg-white text-gray-600 hover:bg-green-50'
    }`;

  return (
    <div className="bg-green-50 min-h-screen font-sans text-gray-800">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-800 tracking-tight">
            AI Gardening Assistant
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Your smart companion for a thriving garden
          </p>
        </header>

        <nav className="p-2 bg-green-100 rounded-xl shadow-inner mb-8">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setActiveTab('identifier')} className={tabClasses('identifier')}>
              <LeafIcon className="w-6 h-6 mr-2" />
              <span className="font-semibold">Plant Identifier</span>
            </button>
            <button onClick={() => setActiveTab('chat')} className={tabClasses('chat')}>
              <ChatBubbleIcon className="w-6 h-6 mr-2" />
              <span className="font-semibold">Chat Assistant</span>
            </button>
          </div>
        </nav>

        <main>
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 min-h-[60vh]">
            {activeTab === 'identifier' ? <PlantIdentifier /> : <ChatAssistant />}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-sm text-gray-500">
            <p>Powered by Gemini AI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
