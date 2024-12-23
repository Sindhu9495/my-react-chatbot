import React from 'react';
import axios from "axios";
import Chatbot from './Chatbot.js';
function App() {
  console.log("App loaded")
  return (
    <div className="App">
      <Chatbot />
    </div>
  );
}

export default App;
