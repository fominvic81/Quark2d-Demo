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
        name: 'mixed',
        fileName: 'performance/Mixed',
        sort: 4,
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

        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,
            showStatus: true,
        });

        engine.world.add(
            Factory.Body.rectangle(new Vector(0, 15), 0, 30, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(0, -15), 0, 30, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(15, 0), 0, 1, 30, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(-15, 0), 0, 1, 30, {type: BodyType.static}),
        );

        for (let i = 0; i < 500; ++i) {
            const sides = Math.floor(rand() * 8);
            if (sides <= 1) {
                engine.world.add(Factory.Body.circle(new Vector(rand() * 25 - 12.5, rand() * 25 - 12.5), 0.5));
            } else if (sides === 2) {
                engine.world.add(Factory.Body.capsule(new Vector(rand() * 25 - 12.5, rand() * 25 - 12.5), 0, 1, rand() * 0.2 + 0.25));
            } else {
                engine.world.add(Factory.Body.polygon(new Vector(rand() * 25 - 12.5, rand() * 25 - 12.5), sides, 0.5, {}, {radius: 0.1}));
            }
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