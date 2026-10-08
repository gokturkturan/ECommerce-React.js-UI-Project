import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { store } from './store/store.js';
import { ToastProvider } from './context/ToastContext.jsx';
import AuthBootstrap from './components/AuthBootstrap.jsx';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastProvider>
          <AuthBootstrap>
            <App />
          </AuthBootstrap>
        </ToastProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
