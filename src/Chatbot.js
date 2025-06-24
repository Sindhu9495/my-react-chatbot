import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const apiUrl = 'https://force-drive-3959-dev-ed.scratch.my.salesforce-sites.com/services/apexrest/AI_Copilot/api/v1.0/';
  const headers = {
    'Content-Type': 'application/json',
  };

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory');
    const savedConversationId = localStorage.getItem('conversationId');
    const savedUser = localStorage.getItem('chatbotUser');

    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }

    if (savedConversationId) {
      setConversationId(savedConversationId);
    }

    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserName(user.name);
      setUserEmail(user.email);
      setIsFirstTime(false);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

useEffect(() => {
  if (!isFirstTime && isOpen && messages.length === 0 && userName) {
    // Add a welcome message only if it hasn't been added yet
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'bot', text: `Hello ${userName}, how can I assist you today?` },
    ]);
  }
}, [isOpen, isFirstTime, userName, messages]);

  
  const handleFormSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('chatbotUser', JSON.stringify({ name: userName, email: userEmail }));
    setIsFirstTime(false);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (userInput.trim()) {
      const userMessage = userInput;
      setMessages([...messages, { sender: 'user', text: userMessage }]);
      setUserInput('');
      setIsLoading(true);

      const data = JSON.stringify({
        configAiName: 'OpenAI',
        dataSourceApiName: 'Fetch_Account_360',
        promptQuery: userMessage,
        conversationId: conversationId, // Pass null for the first request; update afterward
      });

     
      try {
        const result = await axios.post(apiUrl, data, { headers });
        const botMessage = result.data?.message || 'No response received.';
        setMessages((prev) => [...prev, { sender: 'bot', text: botMessage }]);

        // Set the conversation ID from the backend response if provided
        if (result.data?.conversationId && !conversationId) {
          setConversationId(result.data.conversationId);
          localStorage.setItem('conversationId', result.data.conversationId);
        }
      } catch (error) {
        console.error('Error communicating with the API:', error);
        setMessages((prev) => [...prev, { sender: 'bot', text: "Sorry, I couldn't process that. Please try again." }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const endChat = () => {
    localStorage.removeItem('chatbotUser'); // Remove user data
    localStorage.removeItem('chatHistory'); // Remove chat history
    localStorage.removeItem('conversationId'); // Remove conversation ID
    setMessages([]); // Clear messages
    setUserName(''); // Reset username
    setUserEmail(''); // Reset email
    setConversationId(null); // Reset conversation ID
    setIsFirstTime(true); // Show the form again
    setIsOpen(false); // Close the chat window
  };

  return (
    <div className="chatbot-container">
      <div className="chat-icon" onClick={toggleChat}>
        💬
      </div>

      {isOpen && (
        <div className="chat-window">
          {isFirstTime ? (
            <div className="chat-form">
              <h3>Welcome!</h3>
              <form onSubmit={handleFormSubmit}>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
                <button type="submit">Start Chat</button>
              </form>
            </div>
          ) : (
            <>
              <div className="chat-header">
                <div className="profile">
                  <div className="profile-icon">
                    <img src="/avatar.png" alt="User" />
                  </div>
                  <span className="title">Hello, {userName}</span>
                </div>
                <button onClick={endChat} className="end-chat-button">End Chat</button>
              </div>
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div key={index} className={`chat-message ${msg.sender}`}>{msg.text}</div>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot; 
