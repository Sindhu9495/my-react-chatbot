import React, { useState } from 'react';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! Ask me anything." }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    
    if (userInput.trim()) {

      // Add the user's message to the chat
      setMessages([...messages, { sender: "user", text: userInput }]);
      const userMessage = userInput;
      setUserInput("");
      setIsLoading(true);

      const apiUrl = 'https://power-customer-6271-dev-ed.scratch.my.salesforce-sites.com/services/apexrest/AI_Copilot/api/v1.0/';
      const headers = {
        'Accept': '*/*',
        'Access-Control-Allow-Origin': 'Content-Type, Authorization https://power-customer-6271-dev-ed.scratch.my.salesforce-sites.com',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'api_token': '552a73ba-62dd-4472-b3c6-240711042720269', // Your API token
        'Content-Type': 'application/json'
      };
      console.log(userMessage);
      const data = JSON.stringify({
        configAiName: 'OpenAI', // Or whatever AI service you are using
        promptQuery: userMessage, // The message from the user
      });

      try {
        // Make the API call to your custom endpoint
        console.log("Api url" , apiUrl)
        const result = await axios.post(apiUrl, data, { headers });

        console.log("=> Response from API:", result);
        console.log("=> Headers:", result.headers);

        const botMessage = result.data?.message || "No response received.";
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: botMessage }
        ]);
      } catch (error) {

        if (error.response) {
          // The server responded with a status code outside the 2xx range
          console.log('Error response:', error.response);
        } else if (error.request) {
          // The request was made but no response was received
          console.log('Error request:', error.request);
        } else {
          // Something happened in setting up the request that triggered an error
          console.log('Error message:', error.message);
        }
       // console.error("Error communicating with the API:", error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { sender: "bot", text: "Sorry, I couldn't process that. Please try again." }
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
                if (e.key === "Enter" && !isLoading) {
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
