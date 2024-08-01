import { createResource, createSignal, JSXElement, onMount, Show } from 'solid-js';
import * as i18n from "@solid-primitives/i18n";
import style from './ErrorCatcher.module.css';

// this component is intentionally separated from the usual 
// bootstrapping logic in StateController so we have to
// do this config fetching work from scratch

let config = await window.electron.readConfig();

const [ dictionary ] = createResource(() => config.locale, async (langCode: string): Promise<i18n.BaseRecordDict> => {
  const newDictionary = await window.electron.fetchDictionary(langCode);
  const flattened = i18n.flatten(newDictionary as i18n.BaseDict);
  return flattened;
});

const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

const ErrorCatcher = (props: { err: unknown, reset: () => void }): JSXElement => {
  const [ errMsg, setErrMsg ] = createSignal(``);

  onMount(async () => {
    console.debug(props.err);

    // re-read config just incase it changed since initial load
    config = await window.electron.readConfig();

    let result = String(props.err);
    if (props.err instanceof Error) {
      if (props.err.stack != null) {
        result = props.err.stack;
      }
    }

    setErrMsg(result);
  });

  return (
    <div class={style.wrapper}>
      <main class={style.errorBox}>
        <div class={style.centered}>
          <h1>{t(`error.title`)}</h1>
        </div>
        <p>{t(`error.summary`)}</p>
        <Show when={errMsg().length > 0}>
          <p>{t(`error.technical`)}</p>
          <pre class={style.errorMessage}>{errMsg()}</pre>
        </Show>
        <p>{t(`error.conclusion`)}</p>
        <div class={style.centered}>
          <button class={style.errorButton} onClick={() => window.open(`https://github.com/JackDotJS/vincent/issues/new`)}>Open GitHub</button>
          <button class={style.errorButton} onClick={() => props.reset()}>Reload</button>
        </div>
      </main>
    </div>
  );
};

export default ErrorCatcher;
