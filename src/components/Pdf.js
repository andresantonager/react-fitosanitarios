import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom'; // Importa useLocation
/*import '../styles/Pdf.css';*/
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus, faDownload, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

export default function Pdf() {
  const { numRegistro } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const renderToolbar = (Toolbar) => (
    <Toolbar>
      {(slots) => {
        const { ZoomIn, ZoomOut } = slots;
        return (
          <div
            style={{
              alignItems: 'center',
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              paddingLeft: '20px',
              paddingRight: '20px',
            }}
          >
            <div style={{ padding: '0px 2px' }}>
              <FontAwesomeIcon 
                icon={faArrowLeft}
                style={{
                  backgroundColor: '#357edd',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '8px',
                  width: '18px',
                  height: '18px',
                }}
                onClick={() => navigate('/', { state: location.state } )} // Pasa el estado al navegar hacia atrás
              />
            </div>
            <div style={{ padding: '0px 2px' }}>
              <ZoomOut>
                {(props) => (
                  <FontAwesomeIcon
                    icon={faMagnifyingGlassMinus}
                    style={{
                      backgroundColor: '#357edd',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '8px',
                      marginRight: '5px',
                      width: '18px',
                      height: '18px',
                    }}
                    onClick={props.onClick}
                  />
                )}
              </ZoomOut>
              <ZoomIn>
                {(props) => (
                  <FontAwesomeIcon
                    icon={faMagnifyingGlassPlus}
                    style={{
                      backgroundColor: '#357edd',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#ffffff',
                      cursor: 'pointer',
                      padding: '8px',
                      width: '18px',
                      height: '18px',
                    }}
                    onClick={props.onClick}
                  />
                )}
              </ZoomIn>
            </div>
            <div style={{ padding: '0px 2px' }}>
              <FontAwesomeIcon
                icon={faDownload}
                style={{
                  backgroundColor: '#357edd',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '8px',
                  width: '18px',
                  height: '18px',
                }}
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `https://ager-agro.es/API/pdfs_fitos/${numRegistro}.pdf`;
                  link.download = `${numRegistro}.pdf`;
                  link.click();
                }}
              />
            </div>
          </div>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
      renderToolbar,
      sidebarTabs: () => []
  });

  return (
    <div className='pdf-container' style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer fileUrl={`https://ager-agro.es/API/pdfs_fitos/${numRegistro}.pdf`} plugins={[defaultLayoutPluginInstance]} defaultScale={1} />
      </Worker>
    </div>
  );
}
