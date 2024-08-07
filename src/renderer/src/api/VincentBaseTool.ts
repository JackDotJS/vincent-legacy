import { JSXElement } from "solid-js";

export interface VincentToolMetadata {
  name: string,
  namespace: string,
  category: `drawing` | `fill` | `selection` | `move` | `technical` | `other`,
}

export class VincentBaseTool {
  name: VincentToolMetadata[`name`];
  category: VincentToolMetadata[`category`];

  constructor(metadata: VincentToolMetadata) {
    this.name = `${metadata.namespace}:${metadata.name}`;
    this.category = metadata.category;
  }

  pointerEnter(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerEnter script defined for tool: ${this.name}`);
  }

  pointerDown(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerDown script defined for tool: ${this.name}`);
  }

  pointerMove(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerMove script defined fortool: ${this.name}`);
  }

  pointerChange(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerChange script defined for tool: ${this.name}`);
  }

  pointerUp(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerUp script defined for tool: ${this.name}`);
  }

  pointerOut(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerOut script defined for tool: ${this.name}`);
  }

  pointerLeave(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerLeave script defined for tool: ${this.name}`);
  }

  pointerCancel(ev: PointerEvent): void {
    ev; // shut up, typescript
    console.debug(`no pointerCancel script defined for tool: ${this.name}`);
  }

  getOptionsComponent(): JSXElement {
    console.debug(`no options component defined for tool: ${this.name}`);
    return ``;
  }

  getWidgets(): JSXElement {
    console.debug(`no widgets defined for tool: ${this.name}`);
    return ``;
  }
}