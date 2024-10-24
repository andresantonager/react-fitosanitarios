import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { useNavigate, useLocation } from 'react-router-dom';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import logo_nematool from '../assets/logo.png';
import Papa from 'papaparse';
import { AutoComplete } from 'primereact/autocomplete';
import { Widget, addResponseMessage, deleteMessages } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css';
import { Toast } from 'primereact/toast';
        
const Main = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(location.state?.nombre || '');
  const [formulado, setFormulado] = useState(location.state?.formulado || '');
  const [numRegistro, setNumRegistro] = useState(location.state?.numRegistro || '');
  const [titular, setTitular] = useState(location.state?.titular || '');
  const [link, setLink] = useState('');
  const [data, setData] = useState([]);
  const [nombres, setNombres] = useState([]);
  const [formulados, setFormulados] = useState([]);
  const [numRegistros, setNumRegistros] = useState([]);
  const [titulares, setTitulares] = useState([]);
  const [links, setLinks] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredNombres, setFilteredNombres] = useState([]);
  const [filteredFormulados, setFilteredFormulados] = useState([]);
  const [filteredNumRegistros, setFilteredNumRegistros] = useState([]);
  const [filteredTitulares, setFilteredTitulares] = useState([]);
  const [messageCount, setMessageCount] = useState(location.state?.messageCount || 0);
  const [chatHistory, setChatHistory] = useState([]);
  const toast = useRef(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Service-worker.js')
        .catch((error) => console.error('Error al registrar el Service Worker:', error));
    }

    const fetchData = async () => {
      try {
        document.querySelector('.body-div').style.paddingTop = '0';
        const cache = await caches.open('fitosanitarios-cache');
        const cachedResponse = await cache.match('fitosanitarios.csv');
        
        if (cachedResponse && !isRefreshing) {
          const csv = await cachedResponse.text();
          const parsedData = Papa.parse(csv, { header: true }).data;
          setData(parsedData);
          updateOptions(parsedData, nombre, null, null, formulado, link, numRegistro, titular);
        } else {
          const response = await fetch('https://fitos.es/fitos.csv', { cache: 'no-store' });
          const reader = response.body.getReader();
          let decoder = new TextDecoder('utf-8');
          let csv = '';
          let done = false;

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            csv += decoder.decode(value, { stream: true });
          }

          const parsedData = Papa.parse(csv, { header: true }).data;
          setData(parsedData);
          updateOptions(parsedData, nombre, null, null, formulado, link, numRegistro, titular);

          setLoading(false);
          setIsRefreshing(false);

          await cache.put('fitosanitarios.csv', new Response(csv));
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
        // Restablecer el padding-top a su valor original
        document.querySelector('.body-div').style.paddingTop = '';
      }
    };

    fetchData();
  }, [isRefreshing]);

  const checkConnection = async () => {
    try {
      await fetch('https://www.google.com?no-sw=true', { mode: 'no-cors' });
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No tienes conexión a Internet', life: 3000 });
    }
  };

  // Llama a checkConnection al inicio del componente
  useEffect(() => {
    checkConnection();
  }, []);

  const updateOptions = (data, nombre, cultivo, plaga, formulado, link, numRegistro, titular, autoComplete=false) => {
    const nombresSet = new Set();
    const formuladosSet = new Set();
    const linksSet = new Set();
    const numRegistrosSet = new Set();
    const titularesSet = new Set();
    data.forEach(item => {
      let nombreCoincide = ""
      let formuladoCoincide = ""
      let numRegistroCoincide = ""
      let titularCoincide = ""

      if(autoComplete){
        nombreCoincide = !nombre || (nombre && item.Nombre_Comercial && item.Nombre_Comercial.trim().toLowerCase() === nombre.trim().toLowerCase());
        formuladoCoincide = !formulado || (formulado && item.Formulado && item.Formulado.trim().toLowerCase() === formulado.trim().toLowerCase());
        numRegistroCoincide = !numRegistro || (numRegistro && item.Num_Registro && item.Num_Registro.trim().toLowerCase() === numRegistro.trim().toLowerCase());
        titularCoincide = !titular || (titular && item.Titular && item.Titular.trim().toLowerCase() === titular.trim().toLowerCase());
      }else{
        nombreCoincide = !nombre || (nombre && item.Nombre_Comercial && item.Nombre_Comercial.trim().toLowerCase().includes(nombre.trim().toLowerCase()));
        formuladoCoincide = !formulado || (formulado && item.Formulado && item.Formulado.trim().toLowerCase().includes(formulado.trim().toLowerCase()));
        numRegistroCoincide = !numRegistro || (numRegistro && item.Num_Registro && item.Num_Registro.trim().toLowerCase().includes(numRegistro.trim().toLowerCase()));
        titularCoincide = !titular || (titular && item.Titular && item.Titular.trim().toLowerCase().includes(titular.trim().toLowerCase()));
      }
      if (nombreCoincide && formuladoCoincide && numRegistroCoincide && titularCoincide) {
        if (item.Nombre_Comercial) nombresSet.add(item.Nombre_Comercial.trim());
        if (item.Formulado) formuladosSet.add(item.Formulado.trim());
        if (item.Link) linksSet.add(item.Link.trim());
        if (item.Num_Registro) numRegistrosSet.add(item.Num_Registro.trim());
        if (item.Titular) titularesSet.add(item.Titular.trim());
      }
    });

    setNombres(Array.from(nombresSet).sort((a, b) => a.localeCompare(b)));
    setFormulados(Array.from(formuladosSet).sort((a, b) => a.localeCompare(b)));
    setLinks(Array.from(linksSet).sort((a, b) => a.localeCompare(b)));
    setNumRegistros(Array.from(numRegistrosSet).sort((a, b) => a.localeCompare(b)));
    setTitulares(Array.from(titularesSet).sort((a, b) => a.localeCompare(b)));
    
    if (autoComplete) {
      if (Array.from(nombresSet).length === 1) {
        setNombre(Array.from(nombresSet)[0]);
      }
      if (Array.from(formuladosSet).length === 1) {
        setFormulado(Array.from(formuladosSet)[0]);
      }
      if (Array.from(numRegistrosSet).length === 1) {
        setNumRegistro(Array.from(numRegistrosSet)[0]);
      }
      if (Array.from(titularesSet).length === 1) {
        setTitular(Array.from(titularesSet)[0]);
      }
    }
  };

  const searchNombre = (event) => {
    const query = event.query.toLowerCase();
    setFilteredNombres(nombres.filter((nombre) => nombre.toLowerCase().includes(query)));
  };

  const searchFormulado = (event) => {
    const query = event.query.toLowerCase();
    setFilteredFormulados(formulados.filter((formulado) => formulado.toLowerCase().includes(query)));
  };

  const searchNumRegistro = (event) => {
    const query = event.query.toLowerCase();
    setFilteredNumRegistros(numRegistros.filter((numRegistro) => numRegistro.toLowerCase().includes(query)));
  };

  const searchTitular = (event) => {
    const query = event.query.toLowerCase();
    setFilteredTitulares(titulares.filter((titular) => titular.toLowerCase().includes(query)));
  };

  const handleNombreSelect = (e) => {
    setNombre(e.value);
    updateOptions(data, e.value, null, null, formulado, link, numRegistro, titular, true);
  };

  const handleFormuladoSelect = (e) => {
    setFormulado(e.value);
    updateOptions(data, nombre, null, null, e.value, link, numRegistro, titular, true);
  };

  const handleNumRegistroSelect = (e) => {
    setNumRegistro(e.value);
    updateOptions(data, nombre, null, null, formulado, link, e.value, titular, true);
  };

  const handleTitularSelect = (e) => {
    setTitular(e.value);
    updateOptions(data, nombre, null, null, formulado, link, numRegistro, e.value, true);
  };

  const handlePdfButtonClick = async () => {
    console.log(links);
    if (links.length !== 1) {
      return;
    }
    try {
      const response = await fetch(`https://fitos.es/pdfs/${numRegistro}.pdf`);
      console.log(response);
      if (response.ok) { // Cambiado de response.status === 200 a response.ok
        navigate(`/pdf/${numRegistro}`, { state: { nombre, formulado, numRegistro, titular, messageCount } });
      } else {
        toast.current.show({ severity: 'error', summary: 'Error', detail: 'No tienes conexión a Internet', life: 3000 });
      }
    } catch (error) {
      console.error('Error al realizar la solicitud de red:', error); // Añadido para más detalles
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'No tienes conexión a Internet', life: 3000 });
    }
  };

  const handleClearButtonClick = () => {
    setNombre('');
    setFormulado('');
    setNumRegistro('');
    setTitular('');
    navigate(`/`, { state: {} });
    updateOptions(data, '', null, null, '', link, '', '');
  };

  const handleRefreshButtonClick = () => {
    setIsRefreshing(true);
    setLoading(true);
    checkConnection(); // Llama a checkConnection aquí
  };

  const openUrlAutomatically = (text) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const match = urlPattern.exec(text);
    if (match) {
      window.open(match[0], '_blank');
    }
  }

  useEffect(() => {
    if(messageCount === 0){
      addResponseMessage('¡Bienvenido!, hazme la pregunta que necesites sobre cualquier producto fitosanitario.');
      setMessageCount(1);
    }
  }, []);

  const handleNewUserMessage = async (question) => {
    try {
      const processingMessage = 'Estamos procesando su pregunta, por favor espere...';
      addResponseMessage(processingMessage);

      // Cerrar el teclado
      const inputElement = document.querySelector('.rcw-send');
      if (inputElement) {
        inputElement.focus();
        inputElement.blur();
      }

      const url_server = "https://fitos.es";
      const response = await fetch(url_server + '/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question, history: chatHistory }),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }

      const data = await response.json();

      let botResponse = data.response;
      deleteMessages(1);
      addResponseMessage(botResponse);
      setChatHistory(data.history);
      openUrlAutomatically(botResponse);
    } catch (error) {
      console.error('Error al obtener respuesta de ChatGPT:', error);
    }
  };

  return (
    <div className="body-div flex flex-column align-items-center">
      <Toast ref={toast} />
      <div className="header-div flex align-items-center justify-content-center w-full pt-2 pb-2 border-bottom-2 border-black-alpha-90">
        <img src={logo_nematool} alt="Logo" className="mr-1" style={{ width: '150px', height: 'auto' }} />
        <h1 className='ml-1'>Fitosanitarios</h1>
      </div>
      <div className="form-div flex flex-column align-items-center w-11">
        {loading ? (
          <div className="loading"></div>
        ) : (
        <div className='w-full'>
          <form className="flex flex-column align-items-center mt-5 mb-5 w-full">
            <div className="flex flex-column w-full">
              <label htmlFor="numRegistro" className="text-xl font-semibold">Número de Registro:</label>
              <AutoComplete 
                className='mt-2 mb-3 w-full'
                id="numRegistro" 
                value={numRegistro} 
                suggestions={filteredNumRegistros} 
                completeMethod={searchNumRegistro} 
                onChange={(e) => setNumRegistro(e.value)} 
                onSelect={handleNumRegistroSelect}
                inputClassName="w-full"
              />
            </div>
            <div className="flex flex-column w-full">
              <label htmlFor="nombre" className="text-xl font-semibold">Nombre Comercial:</label>
              <AutoComplete 
                className='mt-2 mb-3 w-full'
                id="nombre" 
                value={nombre} 
                suggestions={filteredNombres} 
                completeMethod={searchNombre} 
                onChange={(e) => setNombre(e.value)} 
                onSelect={handleNombreSelect}
                inputClassName="w-full"
              />
            </div>
            <div className="flex flex-column w-full">
              <label htmlFor="formulado" className="text-xl font-semibold">Composición:</label>
              <AutoComplete 
                className='mt-2 mb-3 w-full'
                id="formulado" 
                value={formulado} 
                suggestions={filteredFormulados} 
                completeMethod={searchFormulado} 
                onChange={(e) => setFormulado(e.value)} 
                onSelect={handleFormuladoSelect}
                inputClassName="w-full"
              />
            </div>
            <div className="flex flex-column w-full">
              <label htmlFor="titular" className="text-xl font-semibold">Titular:</label>
              <AutoComplete 
                className='mt-2 w-full'
                id="titular" 
                value={titular} 
                suggestions={filteredTitulares} 
                completeMethod={searchTitular} 
                onChange={(e) => setTitular(e.value)} 
                onSelect={handleTitularSelect}
                inputClassName="w-full"
              />
            </div>
          </form>
          <div className='button-div flex justify-content-around mb-5'>
            <Button 
              label="Ver PDF" 
              onClick={handlePdfButtonClick} 
              className={`p-button ${links.length > 1 ? 'p-disabled' : ''}`}
            />
            <Button 
              label="Limpiar" 
              onClick={handleClearButtonClick} 
              className="p-button"
            />
            <Button 
              icon="pi pi-refresh" 
              onClick={handleRefreshButtonClick} 
              className="p-button-icon-only"
            />
          </div>
        </div>
        )}
      </div>
      
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        subtitle={null}
        emojis={true}
        title={"Chat"}
        showTimeStamp={false}
        senderPlaceHolder={"Escribe tu mensaje..."}
        style={{ maxWidth: '100%', margin: '0 auto' }}
      />
    </div>
  );
};

export default Main;
