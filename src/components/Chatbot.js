import React, { useState, useRef, useEffect } from 'react';
/*import '../styles/Chatbot.css';*/
import logo_nematool from '../assets/logo.png';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus, faDownload, faArrowLeft, faArrowUp, faUser, faRobot, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const Chatbot = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {"role": "system", "content": "Eres un asistente que responde preguntas sobre productos fitosanitarios usando un archivo JSON."}
  ]);
  const [threadId, setThreadId] = useState(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const chatContainerRef = useRef(null);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 5);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
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
      const response = await fetch('https://fitos.es/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pregunta: prompt, thread_id: threadId })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }

      const data = await response.json();

      setThreadId(response.headers.get('X-Thread-Id'));

      let botResponse = data.respuesta;
      botResponse = botResponse.replace(/\n/g, '<br />');
      setChatHistory(data.historial);

    } catch (error) {
      console.error('Error al obtener respuesta de ChatGPT:', error);
      setChatHistory(prevHistory => [...prevHistory, { text: "La dosis del producto FLINT var\u00eda seg\u00fan el cultivo y el agente a controlar. Aqu\u00ed tienes algunos ejemplos:\n\n1. Olivo:\n   - Dosis: 120 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 2 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 14 d\u00edas.\n\n2. Melocotonero:\n   - Dosis: 225 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 3 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 7 d\u00edas.\n\n3. Albaricoquero:\n   - Dosis: 225 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 4 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 7 d\u00edas.\n\n4. Manzano:\n   - Dosis: 150 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 4 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 14 d\u00edas.\n\n5. Tomate:\n   - Dosis: 375 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 3 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 1 d\u00eda.\n\n6. Pimiento:\n   - Dosis: 200 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 3 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 1 d\u00eda.\n\n7. Arroz:\n   - Dosis: 250 g/Ha. por aplicaci\u00f3n (m\u00e1ximo 2 tratamientos por campa\u00f1a).\n   - Plazo de seguridad: 28 d\u00edas.\n\nRecuerda que es importante seguir las indicaciones espec\u00edficas para cada cultivo y agente.", sender: 'bot' }]);
      //setChatHistory(prevHistory => [...prevHistory, { text: "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo.", sender: 'bot' }]);
    }
  };

  return (
    <div className="body-div flex flex-column align-items-center h-screen w-full">
      <div 
        className="chat-container flex flex-column w-full p-3 flex-grow-1 overflow-y-auto w-full" 
        style={{ borderRadius: '10px', backgroundColor: '#E6F2FF' }}
        ref={chatContainerRef}
        onScroll={handleScroll}
      >
        {chatHistory.map((chat, index) => (
          <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
            <div className={`p-3 border-round ${chat.sender === 'user' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`} style={{ maxWidth: '70%', backgroundColor: chat.sender === 'bot' ? '#f0f0f0' : '' }}>
              <FontAwesomeIcon icon={chat.sender === 'user' ? faUser : faRobot} className="mr-2" />
              {chat.text}
            </div>
          </div>
        ))}
      </div>
      <div className="input-container flex w-full p-3 position-relative" style={{ maxWidth: '300px'}}>
        <InputText 
          placeholder="Escribe tu mensaje" 
          className="flex-grow-1 mr-2 ml-2"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button 
          icon="pi pi-send" 
          onClick={handleButtonClick}
          disabled={!message.trim()}
        />
      </div>
    </div>
  )
};

export default Chatbot;
