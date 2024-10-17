import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useNavigate, useLocation } from 'react-router-dom';
import 'primeflex/primeflex.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
/*import '../styles/Main.css';*/ 
import logo_nematool from '../assets/logo.png';
import chatbot from '../assets/chatbot.png';
import Papa from 'papaparse';
import { AutoComplete } from 'primereact/autocomplete';

const Main = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState(location.state?.nombre || '');
  const [formulado, setFormulado] = useState(location.state?.formulado || '');
  const [numRegistro, setNumRegistro] = useState(location.state?.numRegistro || '');
  const [titular, setTitular] = useState(location.state?.titular || '');
  /*
  const [plazoSeguridad, setPlazoSeguridad] = useState(location.state?.plazoSeguridad || '');
  const [aplicaciones, setAplicaciones] = useState(location.state?.aplicaciones || '');
  const [intervaloAplicaciones, setIntervaloAplicaciones] = useState(location.state?.intervaloAplicaciones || '');
  const [dosis, setDosis] = useState(location.state?.dosis || '');
  */
  const [link, setLink] = useState('');
  const [data, setData] = useState([]);
  const [nombres, setNombres] = useState([]);
  const [formulados, setFormulados] = useState([]);
  const [numRegistros, setNumRegistros] = useState([]);
  const [titulares, setTitulares] = useState([]);
  const [links, setLinks] = useState([]);
  const [showNombreSuggestions, setShowNombreSuggestions] = useState(false);
  const [showNumRegistroSuggestions, setShowNumRegistroSuggestions] = useState(false);
  const [showFormuladoSuggestions, setShowFormuladoSuggestions] = useState(false);
  const [showTitularSuggestions, setShowTitularSuggestions] = useState(false);
  const [numRegistroTimeout, setNumRegistroTimeout] = useState(null);
  const [nombreTimeout, setNombreTimeout] = useState(null);
  const [formuladoTimeout, setFormuladoTimeout] = useState(null);
  const [titularTimeout, setTitularTimeout] = useState(null);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filteredNombres, setFilteredNombres] = useState([]);
  const [filteredFormulados, setFilteredFormulados] = useState([]);
  const [filteredNumRegistros, setFilteredNumRegistros] = useState([]);
  const [filteredTitulares, setFilteredTitulares] = useState([]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/Service-worker.js')
        .then(() => console.log('Service Worker registrado'))
        .catch((error) => console.error('Error al registrar el Service Worker:', error));
    }

    const fetchData = async () => {
      try {
        document.querySelector('.body-div').style.paddingTop = '0';
        const cache = await caches.open('fitosanitarios-cache');
        const cachedResponse = await cache.match('fitosanitarios.csv');
        
        if (cachedResponse && !isRefreshing) {
          console.log('Datos leídos desde la caché');
          const csv = await cachedResponse.text();
          const parsedData = Papa.parse(csv, { header: true }).data;
          setData(parsedData);
          updateOptions(parsedData, nombre, null, null, formulado, link, numRegistro, titular);
        } else {
          const response = await fetch('https://ager-agro.es/API/api_fitosanitarios/fitosanitarios.csv', { cache: 'no-store' });
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
          console.log('Datos actualizados');
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

    const checkConnection = async () => {
      try {
        const response = await fetch('https://www.google.com?no-sw=true', { mode: 'no-cors' });
        if (response) {
          setConnectionStatus(true);
        }
      } catch (error) {
        console.log(error)
        setConnectionStatus(false);
      }
    };

    fetchData();
    checkConnection();
  }, [isRefreshing]);

  const updateOptions = (data, nombre, cultivo, plaga, formulado, link, numRegistro, titular, autoComplete=false) => {
    const nombresSet = new Set();
    const formuladosSet = new Set();
    const linksSet = new Set();
    const numRegistrosSet = new Set();
    const titularesSet = new Set();
    /*
    const plazoSeguridadSet = new Set();
    const aplicacionesSet = new Set();
    const intervaloAplicacionesSet = new Set();
    const dosisMaxSet = new Set();
    const dosisMinSet = new Set();
    const dosisUnidadMedidaSet = new Set();
    */
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
        /*
        if (item['Plazo Seguridad']) plazoSeguridadSet.add(item['Plazo Seguridad'].trim());
        if (item['Aplicaciones']) aplicacionesSet.add(item['Aplicaciones'].trim());
        if (item['Intervalo Aplicaciones']) intervaloAplicacionesSet.add(item['Intervalo Aplicaciones'].trim());
        if (item['Dosis_Max']) dosisMaxSet.add(item['Dosis_Max'].trim());
        if (item['Dosis_Min']) dosisMinSet.add(item['Dosis_Min'].trim());
        if (item['Unidad Medida dosis']) dosisUnidadMedidaSet.add(item['Unidad Medida dosis'].trim());
        */
      }
    });

    console.log(nombresSet)
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
      /*
      let completeReadOnly = false;

      if (Array.from(nombresSet).length === 1 && 
          Array.from(formuladosSet).length === 1 && 
          Array.from(numRegistrosSet).length === 1 && 
          Array.from(titularesSet).length === 1) {
        completeReadOnly = true;
      }

      if (Array.from(plazoSeguridadSet).length === 1 && completeReadOnly) {
        setPlazoSeguridad(Array.from(plazoSeguridadSet)[0]);
      }
      if (Array.from(aplicacionesSet).length === 1 && completeReadOnly) {
        setAplicaciones(Array.from(aplicacionesSet)[0]);
      }
      if (Array.from(intervaloAplicacionesSet).length === 1 && completeReadOnly) {
        setIntervaloAplicaciones(Array.from(intervaloAplicacionesSet)[0]);
      }

      if (Array.from(dosisMaxSet).length === 1 && completeReadOnly) {
        let dosis = Array.from(dosisMaxSet)[0]
        if (Array.from(dosisMinSet).length === 1) {
          dosis += ' - ' + Array.from(dosisMinSet)[0]
        }
        if (Array.from(dosisUnidadMedidaSet).length === 1) {
          dosis += ' ' + Array.from(dosisUnidadMedidaSet)[0]
        }
        setDosis(dosis);  
      }
      */
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

  const handleNombreChange = (e) => {
    const newNombre = e.target.value;
    setNombre(newNombre);
    updateOptions(data, newNombre, null, null, formulado, link, numRegistro, titular);
  };

  const handleNombreSuggestionClick = (suggestion) => {
    clearTimeout(nombreTimeout);
    setNombre(suggestion);
    updateOptions(data, suggestion, null, null, formulado, link, numRegistro, titular, true);
    setShowNombreSuggestions(false);
  };

  const handleFormuladoChange = (e) => {
    const newFormulado = e.target.value;
    setFormulado(newFormulado);
    updateOptions(data, nombre, null, null, newFormulado, link, numRegistro, titular);
  };

  const handleFormuladoSuggestionClick = (suggestion) => {
    clearTimeout(formuladoTimeout);
    setFormulado(suggestion);
    updateOptions(data, nombre, null, null, suggestion, link, numRegistro, titular, true);
    setShowFormuladoSuggestions(false);
  };

  const handleNumRegistroChange = (e) => {
    const newNumRegistro = e.target.value;
    setNumRegistro(newNumRegistro);
    updateOptions(data, nombre, null, null, formulado, link, newNumRegistro, titular);
  };

  const handleNumRegistroSuggestionClick = (suggestion) => {
    clearTimeout(numRegistroTimeout);
    setNumRegistro(suggestion);
    updateOptions(data, nombre, null, null, formulado, link, suggestion, titular, true);
    setShowNumRegistroSuggestions(false);
  };

  const handleTitularChange = (e) => {
    const newTitular = e.target.value;
    setTitular(newTitular);
    updateOptions(data, nombre, null, null, formulado, link, numRegistro, newTitular);
  };

  const handleTitularSuggestionClick = (suggestion) => {
    clearTimeout(titularTimeout);
    setTitular(suggestion);
    updateOptions(data, nombre, null, null, formulado, link, numRegistro, suggestion, true);
    setShowTitularSuggestions(false);
  };

  const handlePdfButtonClick = async () => {
    if (links.length !== 1) {
      return;
    }
    try {
      const response = await fetch(`https://ager-agro.es/API/pdfs_fitos/${numRegistro}.pdf`, { cache: 'no-store' });
      if (response.ok) { // Cambiado de response.status === 200 a response.ok
        navigate(`/pdf/${numRegistro}`, { state: { nombre, formulado, numRegistro, titular } });
      } else {
        setError('Error: PDF no disponible. ' + response.status + ' ' + response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud de red:', error); // Añadido para más detalles
      setError('Error: PDF no disponible. ' + error);
    }
  };

  const handleClearButtonClick = () => {
    setNombre('');
    setFormulado('');
    setNumRegistro('');
    setTitular('');
    setError('');
    /*
    setDosis('');
    setPlazoSeguridad('');
    setAplicaciones('');
    setIntervaloAplicaciones('');
    */
    navigate(`/`, { state: {} });
    updateOptions(data, '', null, null, '', link, '', '');
  };

  const handleRefreshButtonClick = () => {
    setIsRefreshing(true);
    setLoading(true);
  };

  return (
    <div className="body-div flex flex-column align-items-center">
      <div className="header-div flex align-items-center justify-content-center w-full pt-2 pb-2 border-bottom-2 border-black-alpha-90">
        <img src={logo_nematool} alt="Logo" className="mr-1" style={{ width: '150px', height: 'auto' }} />
        <h1 className='ml-1'>Fitosanitarios</h1>
      </div>
      <div className="form-div flex flex-column align-items-center w-11">
        {loading ? (
          <div className="showbox">
            <div className="loader">
              <svg className="circular" viewBox="25 25 50 50">
                <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="4" strokeMiterlimit="10"/>
              </svg>
            </div>
          </div>
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
          {error && <div id='error-div' >{error}</div>}
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
          <div className='chatbot-container flex justify-content-end'>
            <img className='chatbot' src={chatbot} alt="Chatbot" style={{ width: '50px', height: 'auto' }} onClick={() => navigate('/chatbot')}/>
          </div>
        </div>
        )}
      </div>
      {!connectionStatus && <div id='offline-warning' >No tienes conexión a Internet</div>}
    </div>
  );
};

export default Main;
