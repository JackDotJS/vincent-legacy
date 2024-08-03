import { createEffect, createSignal, JSXElement, onMount, useContext } from 'solid-js';
import { StateContext } from '../../state/StateController';
import * as i18n from '@solid-primitives/i18n';
import style from './ModalNewFile.module.css';
import { emit } from '@renderer/state/GlobalEventEmitter';

const NewFileModal = (): JSXElement => {
  const { state, setState, dictionary } = useContext(StateContext);

  const t = i18n.translator(() => dictionary(), i18n.resolveTemplate) as Translator;

  const [ bgColor, setBgColor ] = createSignal<string>(`#FFFFFF`);
  const [ keepRatio, setKeepRatio ] = createSignal<boolean>(false);
  const [ width, setWidth ] = createSignal<number>(state.canvas!.width);
  const [ height, setHeight ] = createSignal<number>(state.canvas!.height);

  let previewBox!: HTMLDivElement;

  const updateWidth = (ev: Event): void => {
    if (ev.target == null || !(ev.target instanceof HTMLInputElement)) return;
    const parsed = parseInt(ev.target.value);

    if (isNaN(parsed)) {
      ev.target.value = width().toString();
      return;
    }

    if (keepRatio()) {
      setHeight(Math.round(parsed * (height() / width())));
    }

    setWidth(parsed);
  };

  const updateHeight = (ev: Event): void => {
    if (ev.target == null || !(ev.target instanceof HTMLInputElement)) return;
    const parsed = parseInt(ev.target.value);

    if (isNaN(parsed)) {
      ev.target.value = height().toString();
      return;
    }

    if (keepRatio()) {
      setWidth(Math.round(parsed * (width() / height())));
    }

    setHeight(parsed);
  };

  const swapOrientation = (): void => {
    const newWidth = height();
    const newHeight = width();

    setWidth(newWidth);
    setHeight(newHeight);
  };

  const apply = (): void => {
    state.canvas!.width = width();
    state.canvas!.height = height();
    state.canvas!.style.width = width().toString() + `px`;
    state.canvas!.style.height = height().toString() + `px`;

    state.hiddenCanvas!.width = width();
    state.hiddenCanvas!.height = height();
    state.hiddenCanvas!.style.width = width().toString() + `px`;
    state.hiddenCanvas!.style.height = height().toString() + `px`;

    const ctxMain = state.canvas!.getContext(`2d`);
    const ctxHidden = state.hiddenCanvas!.getContext(`2d`);

    if (ctxMain != null && ctxHidden != null) {
      ctxMain.fillStyle = bgColor();
      ctxHidden.fillStyle = bgColor();

      ctxMain.fillRect(0, 0, width(), height());
      ctxHidden.fillRect(0, 0, width(), height());
    }

    state.history.setHistory([]);
    state.history.setStep(-1);

    emit(`viewport.resetTransform`);

    setState(`modalOpen`, false);
  };

  const aspectRatioText = (): string => {
    const aspectRatio = width() / height();
    const multiplier = Math.pow(10, 5);
    const rounded = Math.round(aspectRatio * multiplier) / multiplier;

    return (`${rounded}:1`);
  };

  onMount(() => {
    setState(`modalTitle`, t(`modal.newfile.title`));
  });

  createEffect(() => {
    previewBox.style.aspectRatio = `${width()} / ${height()}`;
    previewBox.style.backgroundColor = bgColor();
  });

  return (
    <>
      <div class={style.columnWrapper}>
        <div class={style.optionsList}>
          <label>
            {t(`modal.newfile.keepratio`)}
            <input type="checkbox" onChange={(ev) => setKeepRatio(ev.target.checked)} />
          </label>
          <label>
            {t(`modal.newfile.width`)}
            <input type="number" value={width().toString()} onChange={(ev) => updateWidth(ev)} />
            {t(`modal.newfile.pixels`)}
          </label>
          <label>
            {t(`modal.newfile.height`)}
            <input type="number" value={height().toString()} onChange={(ev) => updateHeight(ev)} />
            {t(`modal.newfile.pixels`)}
          </label>
          <button onClick={() => swapOrientation()}>{t(`modal.newfile.orientation`)}</button>
          <label>
            {t(`modal.newfile.color`)}
            <input type="color" value={bgColor()} onChange={(ev) => setBgColor(ev.target.value)} />
          </label>
        </div>
        <div>
          <div class={style.previewBox}>
            <div class={style.preview} ref={previewBox}>
              <span class={style.aspectRatio}>{aspectRatioText()}</span>
              <span class={style.previewText}>{t(`modal.newfile.preview`)}</span>
            </div>
          </div>
        </div>
      </div>
      <div class={style.modalButtons}>
        <button onClick={() => apply()}>{t(`generic.okay`)}</button>
        <button onClick={() => setState(`modalOpen`, false)}>{t(`generic.cancel`)}</button>
      </div>
    </>
  );
};

export default NewFileModal;
