import { App } from './App';
import { Demo, DemoConstructor } from './demo/Demo';
import { Demos } from './demos/Demos';

const DemoByName: Map<string, new (element: HTMLElement) => Demo> = new Map();

for (const demo of Demos) {
    DemoByName.set(demo.options.name, demo);
}

Demos.sort((a, b) => {
    return a.options.name < b.options.name ? -1 : 1;
});

const app = new App(Demos, <DemoConstructor>DemoByName.get('Bridge'));

export {
    App,
    Demo,
    Demos,
    DemoByName,
    app,
}