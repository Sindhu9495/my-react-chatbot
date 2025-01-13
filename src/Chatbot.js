import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! Ask me anything." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const apiUrl =
    "https://business-nosoftware-5580-dev-ed.scratch.my.salesforce-sites.com/services/apexrest/AI_Copilot/api/v1.0/";

  // Load conversationId and messages from localStorage when the component mounts
  useEffect(() => {
    const savedConversationId = localStorage.getItem("conversationId");
    const savedMessages = JSON.parse(localStorage.getItem("messages"));
    if (savedConversationId) {
      setConversationId(savedConversationId);
    }
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const sendMessage = async () => {
    if (userInput.trim()) {
      // Add the user's message to the chat
      const newUserMessage = { sender: "user", text: userInput };
      setMessages((prevMessages) => [
        ...prevMessages,
        newUserMessage,
      ]);
      const userMessage = userInput;
      setUserInput("");
      setIsLoading(true);

      const headers = {
        "Content-Type": "application/json",
      };

      const data = JSON.stringify({
        configAiName: "OpenAI",
        promptQuery: userMessage,
        conversationId, // Send current conversationId
      });

      try {
        // API call to backend
        const result = await axios.post(apiUrl, data, { headers });

        console.log("Response from API:", result.data);

        // Extract and save the conversationId if it is not already set
        if (!conversationId && result.data?.conversationId) {
          const newConversationId = result.data.conversationId;
          setConversationId(newConversationId);
          localStorage.setItem("conversationId", newConversationId);
        }

        const botMessage = result.data?.message || "No response received.";
        const newBotMessage = { sender: "bot", text: botMessage };
        setMessages((prevMessages) => [
          ...prevMessages,
          newBotMessage,
        ]);
      } catch (error) {
        console.error("Error communicating with the API:", error);
        const errorMessage = { sender: "bot", text: "Sorry, I couldn't process that. Please try again." };
        setMessages((prevMessages) => [
          ...prevMessages,
          errorMessage,
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const endChat = () => {
    // Remove conversationId and messages from localStorage
    localStorage.removeItem("conversationId");
    localStorage.removeItem("messages");
    setConversationId(null);
    setMessages([{ sender: "bot", text: "Hello! Ask me anything." }]);
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (conversationId) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages, conversationId]);

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
            <button onClick={endChat}>End Chat</button>
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
