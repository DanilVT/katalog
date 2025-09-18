import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 🔎 Немного диагностик: что приходит во фрейм
window.addEventListener('message', (e) => {
  try {
    console.log('[frame message]', e.data);
  } catch (_) {}
});

// 🔔 Доп. пинг VK-контейнера, если bridge уже есть (на случай, если он подгрузился раньше React)
try {
  if (window.vkBridge && typeof window.vkBridge.send === 'function') {
    window.vkBridge.send('VKWebAppInit');
    console.log('[vkBridge] sent VKWebAppInit from index.js');
  } else {
    console.log('[vkBridge] not ready in index.js at start');
  }
} catch (_) {}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
