import React, { useState } from 'react';
import Button from './ui/Button';

interface ChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'welcome' | 'form' | 'chat'>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  const handleStartChat = () => {
    setStep('form');
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      setStep('chat');
      // Here you would typically initialize the Dialogflow chat
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50">
      <div className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${isMinimized ? 'w-12 h-12' : 'w-80'}`}>
        {/* Chat Header */}
        <div className="bg-gradient-primary text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-primary-blue font-bold">AI</span>
            </div>
            {!isMinimized && <h3 className="font-semibold">Investor Properties NY</h3>}
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={toggleMinimize}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              {isMinimized ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </button>
            {!isMinimized && (
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <div className="h-96 flex flex-col">
            {step === 'welcome' && (
              <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4">
                  <span className="text-white text-2xl font-bold">AI</span>
                </div>
                <h3 className="text-xl font-bold text-primary-blue mb-2">Hello there!</h3>
                <p className="text-gray-600 mb-6">
                  I'm your property assistant. I can help you with questions about our properties, services, and more.
                </p>
                <Button variant="primary" onClick={handleStartChat}>
                  Start Chat
                </Button>
              </div>
            )}

            {step === 'form' && (
              <div className="flex-1 p-6">
                <h3 className="text-lg font-bold text-primary-blue mb-4">Let's get started</h3>
                <p className="text-gray-600 mb-6">
                  Please provide your name and email so I can assist you better.
                </p>
                <form onSubmit={handleSubmitForm} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                      required
                    />
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <Button 
                      variant="outline" 
                      type="button" 
                      onClick={() => setStep('welcome')}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button 
                      variant="primary" 
                      type="submit"
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {step === 'chat' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 bg-gray-50 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-gray-200 rounded-2xl rounded-tl-none px-4 py-2 max-w-xs">
                        <p className="text-gray-800">Hello {name}! How can I help you today?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-gradient-primary text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-xs">
                        <p>I have a question about properties</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
                    />
                    <Button variant="primary">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {isMinimized && (
          <div className="w-12 h-12 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBot;