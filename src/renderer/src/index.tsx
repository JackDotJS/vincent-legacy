import { ErrorBoundary } from 'solid-js';
import { render } from 'solid-js/web';
import App from './App';
import ErrorScreen from './components/ErrorCatcher';
import './global.css';

render(() => {
  return (
    <ErrorBoundary fallback={(err, reset) => <ErrorScreen err={err} reset={reset} />}>
      <App />
    </ErrorBoundary>
  );
}, document.body);