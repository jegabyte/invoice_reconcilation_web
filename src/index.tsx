import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Initialize Firebase Analytics
import { initializeAnalytics } from './config/firebase';

// Initialize analytics
initializeAnalytics().then((analytics) => {
    if (analytics) {
        console.log('Firebase Analytics initialized');
    }
});

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
