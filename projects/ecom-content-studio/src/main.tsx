import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js?v=${__APP_BUILD_ID__}`, { updateViaCache: 'none' }).then(registration => registration.update()).catch(error => {
      // An active worker already has a complete cache; updates may fail offline.
      if (!navigator.serviceWorker.controller) console.warn('当前浏览器未能准备离线缓存，已打开的工作台仍可本地使用。', error);
    });
  });
}
