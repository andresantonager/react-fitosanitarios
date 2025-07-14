import React, { useState, useEffect } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import pwaSafari from '../assets/pwa-safari.svg';
import pwaShare from '../assets/pwa-share.svg';
import pwaAdd from '../assets/pwa-add.svg';

export const ModalInstall = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [message, setMessage] = useState('');
    const [showAccept, setShowAccept] = useState('');
    const [showIcon, setShowIcon] = useState('pi pi-exclamation-triangle');
    const [justifyContent, setJustifyContent] = useState('flex justify-content-between');

    const isPWAInstalled = () => {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    };

    useEffect(() => {
        const checkAndShowModal = () => {
            const remindLaterTimestamp = localStorage.getItem('remindLaterInstallTimestamp');
            const currentTime = new Date().getTime();
            const userAgent = navigator.userAgent;

            if (/iPad|iPhone|iPod/.test(userAgent)){
                setMessage(`
                    <div style="margin-bottom: 1em;">
                        Instala la app para disfrutar de la mejor experiencia. Para ello, sigue estos pasos:
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 1em;">
                        <img src="${pwaSafari}" alt="Safari Icon" style="margin-right: 10px;" />
                        <p style="margin: 0;">1. Abre la página en el navegador web Safari</p>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 1em;">
                        <img src="${pwaShare}" alt="Share Icon" style="margin-right: 10px;" />
                        <p style="margin: 0;">2. Presiona compartir en la barra de direcciones</p>
                    </div>
                    <div style="display: flex; align-items: center; margin-bottom: 1em;">
                        <img src="${pwaAdd}" alt="Add Icon" style="margin-right: 10px;" />
                        <p style="margin: 0;">3. Presiona añadir a pantalla de inicio</p>
                    </div>
                `);
                setShowAccept('hidden');
                setShowIcon('');
                setJustifyContent('flex justify-content-center');
            } else {
                setMessage("Instala la app para tener la mejor experiencia.");
            }

            if (!isPWAInstalled() && (!remindLaterTimestamp || currentTime - remindLaterTimestamp > 86400000)) {
                setIsOpen(true);
            }
        };

        checkAndShowModal();

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const intervalId = setInterval(checkAndShowModal, 20000); // Verifica cada 20 segundos

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            clearInterval(intervalId);
        };
    }, []);

    const handleInstall = () => {
        localStorage.setItem('remindLaterInstallTimestamp', new Date().getTime());
        setIsOpen(false);

        if (deferredPrompt) {
            deferredPrompt.prompt();
            setDeferredPrompt(null);
        }
    };

    const handleRemindMeLater = () => {
        localStorage.setItem('remindLaterInstallTimestamp', new Date().getTime());
        setIsOpen(false);
    };

    return (
        <>
            <ConfirmDialog
                visible={isOpen}
                className="w-11"
                style={{ maxWidth: '500px', color: 'black' }}
                onHide={() => setIsOpen(false)}
                message={<span dangerouslySetInnerHTML={{ __html: message }} style={{ color: 'black' }} />}
                header={<span style={{ color: 'black' }}>Recomendación</span>}
                icon={showIcon}
                baseZIndex={10000}
                accept={handleInstall}
                acceptLabel="Instalar"
                reject={handleRemindMeLater}
                rejectLabel="Recordar más tarde"
                messageClassName="mb-4"
                acceptClassName={showAccept}
                defaultFocus="none"
                focusOnShow={false}
                closable={false}
                pt={{
                    message: {
                        className: showIcon === '' ? 'ml-0' : ''
                    },
                    footer: {
                        className: justifyContent
                    }
                }}
            />
        </>
    );
};
