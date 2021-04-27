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
import { Demo } from '../demo/Demo';


export default class extends Demo {
    static options = {
        name: 'Sleeping',
        fileName: 'Sleeping',
        info: '',
    }
    engine: Engine;
    runner: Runner;
    render: Render;

    constructor (element: HTMLElement) {
        super(element);

        const engine = new Engine();
        engine.sleeping.setType(SleepingType.BODY_SLEEPING);

        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 10), 0, 20, 1, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(-10, 0), 0, 1, 20, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(10, 0), 0, 1, 20, {type: BodyType.static}));

        const position = Vector.temp[0];
        for (let i = 0; i < 10; ++i) {
            for (let j = 0; j < 10; ++j) {
                engine.world.add(Factory.Body.polygon(position.set(i - 4.5, j - 2), 3 + i % 3 + j % 2, 0.3, {}, {radius: 0.2}));
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