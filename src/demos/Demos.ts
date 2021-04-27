import { Demo } from '../demo/Demo';
import Pool from './Pool';
import Bridge from './Bridge';
import ConveyorBelt from './ConveyorBelt';
import Pyramid from './Pyramid';
import Friction from './Friction';
import Chains from './Chains';
import Stacking from './Stacking';
import DoublePendulum from './DoublePendulum';
import Tumbler from './Tumbler';
import Sleeping from './Sleeping';
import WreckingBall from './WreckingBall';
import Gravity from './Gravity';
import Drawing from './Drawing';
import Raycasting from './Raycasting';
import Filtering from './Filtering';
import Kinematic from './Kinematic';
import Sensor from './Sensor';


export const Demos = [
    Pool,
    Bridge,
    ConveyorBelt,
    Pyramid,
    Friction,
    Chains,
    Stacking,
    DoublePendulum,
    Tumbler,
    Sleeping,
    WreckingBall,
    Gravity,
    Drawing,
    Raycasting,
    Filtering,
    Kinematic,
    Sensor,
];

export const DemoByName: Map<string, new (element: HTMLElement) => Demo> = new Map();

for (const demo of Demos) {
    DemoByName.set(demo.options.name, demo);
}

Demos.sort((a, b) => {
    return a.options.name < b.options.name ? -1 : 1;
});