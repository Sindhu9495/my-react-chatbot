import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const apiUrl = 'https://power-customer-6271-dev-ed.scratch.my.salesforce-sites.com/services/apexrest/AI_Copilot/api/v1.0/';
  const headers = { 'Content-Type': 'application/json' };

  // Fetch conversation history when chat is opened
  useEffect(() => {
    if (isOpen && conversationId) {
      fetchConversationHistory();
    }
  }, [isOpen]);

  const fetchConversationHistory = async () => {
    try {
      const response = await axios.get(`${apiUrl}/history`, {
        params: { conversationId },
        headers,
      });
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (userInput.trim()) {
      const newMessage = { sender: 'user', text: userInput };
      setMessages([...messages, newMessage]);

      const requestBody = {
        configAiName: 'OpenAI',
        promptQuery: userInput,
        conversationId,
      };

      setUserInput('');
      setIsLoading(true);

      try {
        const response = await axios.post(apiUrl, requestBody, { headers });
        const botResponse = response.data.message || 'No response received.';
        setConversationId(response.data.conversationId); // Update conversation ID if provided
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: botResponse },
        ]);
      } catch (error) {
        console.error('Error communicating with the API:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: 'bot', text: 'Sorry, something went wrong. Please try again.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-icon" onClick={toggleChat}>💬</div>
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
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
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
                if (e.key === 'Enter' && !isLoading) sendMessage();
              }}
            />
            <button onClick={sendMessage} disabled={isLoading}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
