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
        name: 'Fixed rotation',
        fileName: 'FixedRotation',
        info: '',
        sort: 0,
    }
    engine: Engine;
    runner: Runner;
    render: Render;

    constructor (element: HTMLElement) {
        super(element);

        const engine = new Engine();
        engine.sleeping.setType(SleepingType.NO_SLEEPING);

        // @ts-ignore
        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 50,
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 12), 0, 30, 1, {type: BodyType.static}));

        for (let i = 0; i < 10; ++i) {
            const body = Factory.Body.rectangle(new Vector((i % 2 - 0.5) * 0.5, i), 0, 1, 1);
            body.setFixedRotation(true);
            engine.world.add(body);
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