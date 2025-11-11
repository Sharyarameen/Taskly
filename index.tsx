import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Installer from './components/Installer';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const isInstalled = localStorage.getItem('smashx_installed') === 'true';

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {isInstalled ? <App /> : <Installer />}
  </React.StrictMode>
);