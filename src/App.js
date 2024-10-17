import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Main from './components/Main';
import Pdf from './components/Pdf';
import ChatbotWrapper from './components/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/pdf/:numRegistro" element={<Pdf />} />
        <Route path="/chatbot" element={<ChatbotWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
