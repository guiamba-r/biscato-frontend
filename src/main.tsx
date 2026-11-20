import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {SessionProvider} from './session/SessionContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <SessionProvider>
    <App />
  </SessionProvider>,
);
