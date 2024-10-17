import React, { useState, useRef, useEffect } from 'react';
/*import '../styles/Chatbot.css';*/
import logo_nematool from '../assets/logo.png';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus, faDownload, faArrowLeft, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const Chatbot = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const trimmedMessage = message.trim();
      setMessage('');

      if (trimmedMessage === "borrar") {
        setChatHistory([]);
      } else {
        setChatHistory(prevHistory => [...prevHistory, { text: trimmedMessage, sender: 'user' }]);
        await fetchChatGPTResponse(trimmedMessage);
      }
    }
  };

  const handleButtonClick = async () => {
    const trimmedMessage = message.trim();
    setMessage('');

    if (trimmedMessage === "borrar") {
      setChatHistory([]);
    } else {
      setChatHistory(prevHistory => [...prevHistory, { text: trimmedMessage, sender: 'user' }]);
      await fetchChatGPTResponse(trimmedMessage);
    }
  };

  const fetchChatGPTResponse = async (prompt) => {
    try {
      const response = await fetch('https://fitos.es/api/ask', { // Asegúrate de que la URL coincida con la de tu servidor
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pregunta: prompt })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      console.log(response);
      const data = await response.json();
      console.log(data);
      let botResponse = data.respuesta;
      botResponse = botResponse.replace(/\n/g, '<br />');

      setChatHistory(prevHistory => [...prevHistory, { text: botResponse, sender: 'bot', isHtml: true }]);
    } catch (error) {
      console.error('Error al obtener respuesta de ChatGPT:', error);
      setChatHistory(prevHistory => [...prevHistory, { text: "La dosis del producto FLINT var\u00eda seg\u00fan el cultivo y el agente a controlar. Aqu\u00ed tienes algunos ejemplos:\n\n1. Olivo:\n   - Dosis: 120 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 2 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 14 d\u00edas.\n\n2. Melocotonero:\n   - Dosis: 225 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 3 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 7 d\u00edas.\n\n3. Albaricoquero:\n   - Dosis: 225 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 4 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 7 d\u00edas.\n\n4. Manzano:\n   - Dosis: 150 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 4 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 14 d\u00edas.\n\n5. Tomate:\n   - Dosis: 375 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 3 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 1 d\u00eda.\n\n6. Pimiento:\n   - Dosis: 200 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 3 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 1 d\u00eda.\n\n7. Arroz:\n   - Dosis: 250 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 2 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 28 d\u00edas.\n\nRecuerda que es importante seguir las indicaciones espec\u00edficas para cada cultivo y agente.", sender: 'bot' }]);
      //setChatHistory(prevHistory => [...prevHistory, { text: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.", sender: 'bot' }]);
    }
  };

  return (
    <div>
      <div className="header-div">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <img src={logo_nematool} alt="Logo" className="header-logo" />
        <h1 id="chatbot-title">Fitosanitarios</h1>
      </div>
      <div id="chat-wrapper">
        <div id="chat-container" ref={chatContainerRef}>
          {chatHistory.map((chat, index) => (
            <div key={index} className={`chat-bubble mensaje ${chat.sender}`}>
              {chat.isHtml ? (
                <span dangerouslySetInnerHTML={{ __html: chat.text }}></span>
              ) : (
                chat.text.split('\n').map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))
              )}
            </div>
          ))}
        </div>
        <div id="input-wrapper" className="input-container">
          <textarea 
            id="chat-input" 
            placeholder="Escribe el nombre comercial" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="1"
          />
          <button 
            onClick={handleButtonClick} 
            className="input-button" 
            disabled={!message.trim()}
          >
            <FontAwesomeIcon icon={faArrowUp} className="arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
