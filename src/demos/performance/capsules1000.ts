import {
    BodyType,
    DistanceConstraint,
    Engine,
    Factory,
    Mouse,
    MouseConstraint,
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../../demo/Demo';

export default class extends Demo {
    static options = {
        name: '1000 capsules',
        fileName: 'performance/capsules1000',
        sort: 5,
        info: '',
    }
    engine: Engine;
    runner: Runner;
    render: Render;

    constructor (element: HTMLElement) {
        super(element);

        let seed = 16484;
        const rand = () => {
            seed = (8677 * seed + 89041) % 19763;
            return seed / 19762;
        }

        const engine = new Engine();
        engine.sleeping.setType(SleepingType.NO_SLEEPING);

        // @ts-ignore
        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 30,
            showStatus: true,
        });

        engine.world.add(
            Factory.Body.rectangle(new Vector(0, 20), 0, 40, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(0, -20), 0, 40, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(20, 0), 0, 1, 40, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(-20, 0), 0, 1, 40, {type: BodyType.static}),
        );

        for (let i = 0; i < 1000; ++i) {
            engine.world.add(Factory.Body.capsule(new Vector(rand() * 30 - 15, rand() * 30 - 15), rand() * Math.PI, 0.8, 0.4, {}, {radius: 0.1}));
        }

        new MouseConstraint(engine, <Mouse><unknown>render.mouse, [new DistanceConstraint({
            stiffness: 0.001,
            damping: 0.02,
        })]);

        const runner = new Runner();

        runner.events.on('update', timestamp => {
            engine.update(timestamp);
        });
        runner.events.on('render', timestamp => {
            render.update(timestamp.delta);
        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}