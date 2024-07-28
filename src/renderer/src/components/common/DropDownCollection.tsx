import { Accessor, createContext, createSignal, JSXElement, onMount, Setter } from 'solid-js';

interface DropDownCollectionData {
  activated: Accessor<boolean>,
  setActivated: Setter<boolean>,
  selectedId: Accessor<string>,
  setSelectedId: Setter<string>,
  targetElement: Accessor<Element|null>,
  setTargetElement: Setter<Element|null>
}

export const DropDownCollectionContext = createContext<DropDownCollectionData>({
  activated: () => false,
  setActivated: () => {},
  selectedId: () => `0`,
  setSelectedId: () => {},
  targetElement: () => null,
  setTargetElement: () => {}
});

export const DropDownCollection = (props: { children: JSXElement }): JSXElement => {
  const [ activated, setActivated ] = createSignal(false);
  const [ selectedId, setSelectedId ] = createSignal(`0`);
  const [ targetElement, setTargetElement ] = createSignal<Element|null>(null);

  let wrapper!: HTMLDivElement;

  const data: DropDownCollectionData = {
    activated,
    setActivated,
    selectedId,
    setSelectedId,
    targetElement,
    setTargetElement
  };

  onMount(() => {
    document.addEventListener(`pointerdown`, (ev: PointerEvent) => {
      if (ev.target == null) return;
      const target = ev.target as Element;

      if (wrapper.contains(target)) {
        setActivated(true);
      } else {
        setActivated(false);
      }
    });
  });

  return (
    <DropDownCollectionContext.Provider value={data}>
      <div ref={wrapper}>
        {props.children}
      </div>
    </DropDownCollectionContext.Provider>
  );
};