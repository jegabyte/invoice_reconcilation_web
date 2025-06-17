import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { store } from './store'
import App from './App'
import './styles/globals.css'

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Provider store={store}>
            <GoogleOAuthProvider clientId={googleClientId}>
                <App />
            </GoogleOAuthProvider>
        </Provider>
    </React.StrictMode>,
)
