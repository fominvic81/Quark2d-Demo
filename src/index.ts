import { App } from './App';
import { Demo } from './demo/Demo';
import { Demos } from './demos/Demos';
import quark2d from 'quark2d';

const DemoByName: Map<string, new (element: HTMLElement) => Demo> = new Map();

for (const demo of Demos) {
    DemoByName.set(demo.options.name, demo);
}

Demos.sort((a, b) => {
    return (a.options.sort - b.options.sort) || (a.options.name < b.options.name ? -1 : 1);
});

for (const ns of Object.entries(quark2d)) {
    // @ts-ignore
    window[ns[0]] = ns[1];
}

const app = new App(Demos, 'Bridge');

export {
    App,
    Demo,
    Demos,
    DemoByName,
    app,
}