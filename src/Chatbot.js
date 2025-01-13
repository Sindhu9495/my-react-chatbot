import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! Ask me anything.' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  // On component mount, check for a saved conversation ID and chat history
  useEffect(() => {
    const savedConversationId = localStorage.getItem('conversationId');
    const savedMessages = localStorage.getItem('chatHistory');
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever they update
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (userInput.trim()) {
      // Add the user's message to the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: userInput },
      ]);
      const userMessage = userInput;
      setUserInput('');
      setIsLoading(true);

      const apiUrl =
        'https://business-nosoftware-5580-dev-ed.scratch.my.salesforce-sites.com/services/apexrest/AI_Copilot/api/v1.0/';
      const headers = {
        'Content-Type': 'application/json',
        conversationId: conversationId || undefined, // Include conversationId if it exists
      };

      const data = JSON.stringify({
        configAiName: 'OpenAI',
        promptQuery: userMessage,
      });

      try {
        // Make the API call
        const result = await axios.post(apiUrl, data, { headers });

        console.log('Response from API:', result);

        // If conversationId is not set (first message), retrieve and save it
        const newConversationId = result.data?.conversationId;
        if (!conversationId && newConversationId) {
          setConversationId(newConversationId);
          localStorage.setItem('conversationId', newConversationId);
        }

        // Add bot's response to the chat
        const botMessage = result.data?.message || 'No response received.';
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: botMessage },
        ]);
      } catch (error) {
        console.error('Error communicating with the API:', error);

        // Show error message in the chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: "Sorry, I couldn't process that. Please try again." },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Icon */}
      <div className="chat-icon" onClick={toggleChat}>
        💬
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="profile">
              <div className="profile-icon">
                <img src="/avatar.png" alt="User Profile" />
              </div>
              <span className="title">Chatbot</span>
            </div>
            <button onClick={toggleChat}>×</button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.sender}`}>
                {message.text}
              </div>
            ))}
            {isLoading && <div className="chat-message bot">Typing...</div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  sendMessage();
                }
              }}
            />
            <button onClick={sendMessage} disabled={isLoading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
