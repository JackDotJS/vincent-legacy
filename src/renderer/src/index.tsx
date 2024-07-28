import { render } from 'solid-js/web';
import { StateController } from './state/StateController';
import App from './App';
import './global.css';
import './state/GlobalEventEmitter';
import './util/keyComboListener';

render(() => {
  return (
    <StateController>
      <App />
    </StateController>
  );
}, document.body);