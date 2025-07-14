import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { ModalInstall } from './ModalInstall';
        
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
  const autoCompleteNumRegistroRef = useRef(null);
  const autoCompleteNombreRef = useRef(null);
  const autoCompleteFormuladoRef = useRef(null);
  const autoCompleteTitularRef = useRef(null);
  const [threadId, setThreadId] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Service-worker.js')
        .catch((error) => console.error('Error al registrar el Service Worker:', error));
    }

    const fetchData = async () => {
      try {
        document.querySelector('.body-div').style.paddingTop = '0';
        const cache = await caches.open('fitosanitarios-cache-v2.0');
        const cachedResponse = await cache.match('fitosanitarios.csv');
        
        if (cachedResponse && !isRefreshing) {
          console.log("Datos cargados desde el caché");
          const csv = await cachedResponse.text();
          const parsedData = Papa.parse(csv, { header: true }).data;
          setData(parsedData);
          updateOptions(parsedData, nombre, null, null, formulado, link, numRegistro, titular);
        } else {
          console.log("Datos cargados desde el servidor");
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
    const query = (event.query || "").toLowerCase();
    setFilteredNumRegistros(numRegistros.filter((numRegistro) => numRegistro.toLowerCase().includes(query)));
  };

  const handleOnFocus = (autoComplete, isNumRegistro=false, isNombre=false, isFormulado=false, isTitular=false) => {
    // Invocamos la función de búsqueda con query vacío para cargar todas las sugerencias
    if(isNumRegistro){
      searchNumRegistro({ query: '' });
    }
    if(isNombre){
      searchNombre({ query: '' });
    }
    if(isFormulado){
      searchFormulado({ query: '' });
    }
    if(isTitular){
      searchTitular({ query: '' });
    }

    // Si la referencia está asignada y contiene el método show, lo llamamos para mostrar el panel
    if (autoComplete.current && autoComplete.current.show) {
      autoComplete.current.show();
    }
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
      // Añadir un div de loading a la clase rcw-messages-container
      const messagesContainer = document.querySelector('.rcw-messages-container');
      let loadingDiv;
      if (messagesContainer) {
        loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-container';
        
        const loadingChatDiv = document.createElement('div');
        loadingChatDiv.className = 'loading-chat';
        
        loadingDiv.appendChild(loadingChatDiv);
        messagesContainer.appendChild(loadingDiv);
      }
      // Cerrar el teclado
      const inputElement = document.querySelector('.rcw-send');
      if (inputElement) {
        inputElement.focus();
        inputElement.blur();
      }

      const response = await fetch('https://fitos.es/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question, history: chatHistory, thread_id: threadId }),
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      } else if (loadingDiv) {
        messagesContainer.removeChild(loadingDiv);
      }

      setThreadId(response.headers.get('X-Thread-Id'));

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let botResponse = '';
      let completeResponse = '';
      let scrollCount = 0;

      // Añadir un mensaje inicial vacío
      addResponseMessage('');

      // Esperar un breve momento para asegurarse de que el mensaje se ha añadido
      setTimeout(() => {
        // Obtener el último mensaje añadido después de añadir el mensaje vacío
        const messages = document.querySelectorAll('.rcw-message-text');
        const lastMessageElement = messages[messages.length - 1];

        // Leer el stream de datos
        (async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            completeResponse += chunk;

            // Buscar el marcador de inicio del historial
            const historyMarkerIndex = completeResponse.indexOf("\nhistorial: ");
            if (historyMarkerIndex !== -1) {
              // Separar la respuesta del historial
              botResponse = completeResponse.substring(0, historyMarkerIndex).trim();
              const historyJson = completeResponse.substring(historyMarkerIndex + 12).trim();

              // Abrir las URLs encontradas en la respuesta, de momento no se hace para eso esta la pantalla previa
              // openUrlAutomatically();

              // Actualizar el historial
              setChatHistory(JSON.parse(historyJson));
              // Salir del bucle ya que hemos procesado todo
              break;
            }

            // Transformar texto en negrita y encabezados de nivel 3
            const formattedResponse = completeResponse
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/### (.*?)\n/g, '<h3>$1</h3>\n')
                .replace(/"([^"]+)"/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<strong>$1</strong>')
                .replace(/#### (.*?)\n/g, '<h4>$1</h4>\n')
                .replace(/\[Descargar.*?\]\(sandbox:\/mnt\/data\/([^\/\)]+)\)/g, '<a href="#" style="color: blue; text-decoration: underline;" onclick="downloadFile(\'$1\')">$1</a>')
                .replace(/\/mnt\/data\/([^\/\s\)]+)/g, '<a href="#" style="color: blue; text-decoration: underline;" onclick="downloadFile(\'$1\')">$1</a>')
                .replace(/\n/g, '<br>');

            // Actualizar el contenido del último mensaje
            if (lastMessageElement) {
              lastMessageElement.innerHTML = formattedResponse;
              // Desplazar hacia abajo cada vez que se actualiza el mensaje, hasta un máximo de 100 veces
              if (scrollCount < 100) {
                  const messagesContainer = document.querySelector('.rcw-messages-container');
                  if (messagesContainer) {
                      messagesContainer.scrollTop = messagesContainer.scrollHeight;
                      scrollCount++; // Incrementar el contador
                  }
              }
            }
          }
        })();
      }, 100); // Ajusta el tiempo de espera según sea necesario

      openUrlAutomatically(botResponse);
    } catch (error) {
      console.error('Error al obtener respuesta de ChatGPT:', error);
    }
  };

  // 1) Definimos la función dentro del componente para que pueda
  //    usar `toast.current` y demás refs de React.
  const downloadFile = useCallback(async (filename) => {
    try {
      const response = await fetch('https://fitos.es/api/get_file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename
        })
      });
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar el archivo', error);
      toast.current.show({
        severity: 'error',
        summary: 'Descarga fallida',
        detail: 'No se pudo descargar el archivo',
        life: 3000
      });
    }
  }, [toast]);

  // 2) Exponemos la función en el ámbito global para que 
  //    los onclick inline la puedan invocar.
  useEffect(() => {
    window.downloadFile = downloadFile;
  }, [downloadFile]);

  return (
      <><ModalInstall /><div className="body-div flex flex-column align-items-center">
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
                  ref={autoCompleteNumRegistroRef}
                  className='mt-2 mb-3 w-full'
                  id="numRegistro"
                  value={numRegistro}
                  suggestions={filteredNumRegistros}
                  completeMethod={searchNumRegistro}
                  minLength={0}
                  onChange={(e) => setNumRegistro(e.value)}
                  onFocus={() => handleOnFocus(autoCompleteNumRegistroRef, true, false, false, false)}
                  onSelect={handleNumRegistroSelect}
                  inputClassName="w-full" />
              </div>
              <div className="flex flex-column w-full">
                <label htmlFor="nombre" className="text-xl font-semibold">Nombre Comercial:</label>
                <AutoComplete
                  ref={autoCompleteNombreRef}
                  className='mt-2 mb-3 w-full'
                  id="nombre"
                  value={nombre}
                  suggestions={filteredNombres}
                  completeMethod={searchNombre}
                  onChange={(e) => setNombre(e.value)}
                  onFocus={() => handleOnFocus(autoCompleteNombreRef, false, true, false, false)}
                  onSelect={handleNombreSelect}
                  inputClassName="w-full" />
              </div>
              <div className="flex flex-column w-full">
                <label htmlFor="formulado" className="text-xl font-semibold">Composición:</label>
                <AutoComplete
                  ref={autoCompleteFormuladoRef}
                  className='mt-2 mb-3 w-full'
                  id="formulado"
                  value={formulado}
                  suggestions={filteredFormulados}
                  completeMethod={searchFormulado}
                  onChange={(e) => setFormulado(e.value)}
                  onFocus={() => handleOnFocus(autoCompleteFormuladoRef, false, false, true, false)}
                  onSelect={handleFormuladoSelect}
                  inputClassName="w-full" />
              </div>
              <div className="flex flex-column w-full">
                <label htmlFor="titular" className="text-xl font-semibold">Titular:</label>
                <AutoComplete
                  ref={autoCompleteTitularRef}
                  className='mt-2 w-full'
                  id="titular"
                  value={titular}
                  suggestions={filteredTitulares}
                  completeMethod={searchTitular}
                  onChange={(e) => setTitular(e.value)}
                  onFocus={() => handleOnFocus(autoCompleteTitularRef, false, false, false, true)}
                  onSelect={handleTitularSelect}
                  inputClassName="w-full" />
              </div>
            </form>
            <div className='button-div flex justify-content-around mb-5'>
              <Button
                label="Ver PDF"
                onClick={handlePdfButtonClick}
                className={`p-button ${links.length > 1 ? 'p-disabled' : ''}`} />
              <Button
                label="Limpiar"
                onClick={handleClearButtonClick}
                className="p-button" />
              <Button
                icon="pi pi-refresh"
                onClick={handleRefreshButtonClick}
                className="p-button-icon-only" />
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
        style={{ maxWidth: '100%', margin: '0 auto' }} />
    </div>
    <div style={{
        position: "fixed",
        bottom: "35px",
        left: "10px",
        fontSize: "0.9rem",
        color: "black",
        backgroundColor: "rgba(255,255,255,0.8)",
        padding: "4px 8px",
        borderRadius: "4px"
      }}>
      Versión 2.0
    </div>
    </>
  );
};

export default Main;
