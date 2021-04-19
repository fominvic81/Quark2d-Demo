import { Demo } from '../demo/Demo';
import Pool from './Pool';
import Bridge from './Bridge';
import ConveyorBelt from './ConveyorBelt';
import Pyramid from './Pyramid';
import Friction from './Friction';
import NewtonsCradle from './NewtonsCradle';
import Chains from './Chains';
import Stacking from './Stacking';
import DoublePendulum from './DoublePendulum';
import Tumbler from './Tumbler';


export const Demos = [
    Pool,
    Bridge,
    ConveyorBelt,
    Pyramid,
    Friction,
    NewtonsCradle,
    Chains,
    Stacking,
    DoublePendulum,
    Tumbler,
];

export const DemoByName: Map<string, new (element: HTMLElement) => Demo> = new Map();

for (const demo of Demos) {
    DemoByName.set(demo.options.name, demo);
}

Demos.sort((a, b) => {
    return a.options.name < b.options.name ? -1 : 1;
});