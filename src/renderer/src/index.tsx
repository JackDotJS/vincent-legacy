import { render } from 'solid-js/web';
import { StateController } from './state/StateController';
import App from './App';
import './global.css';
import './util/GlobalEventEmitter';
import './util/InputListener';

render(() => {
  return (
    <StateController>
      <App />
    </StateController>
  );
}, document.body);