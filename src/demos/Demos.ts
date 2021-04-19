import { Demo } from '../demo/Demo';
import Pool from './Pool';
import Bridge from './Bridge';
import ConveyorBelt from './ConveyorBelt';
import Pyramid from './Pyramid';


export const Demos = [
    Pool,
    Bridge,
    ConveyorBelt,
    Pyramid,
];

export const DemoByName: Map<string, new (element: HTMLElement) => Demo> = new Map();

for (const demo of Demos) {
    DemoByName.set(demo.options.name, demo);
}

Demos.sort((a, b) => {
    return a.options.name < b.options.name ? -1 : 1;
});