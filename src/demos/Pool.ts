import {
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Mouse,
    MouseJoint,
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';


export default class extends Demo {
    static options = {
        name: 'Pool',
        fileName: 'Pool',
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
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,
        });

        engine.world.add(Factory.Body.capsule(new Vector(0, 10), 0, 20, 0.5, {type: BodyType.static}));
        engine.world.add(Factory.Body.capsule(new Vector(10, 0), Math.PI * 0.5, 20, 0.5, {type: BodyType.static}));
        engine.world.add(Factory.Body.capsule(new Vector(-10, 0), Math.PI * 0.5, 20, 0.5, {type: BodyType.static}));


        const position = Vector.temp[0];
        for (let i = 0; i < 10; ++i) {
            for (let j = 0; j < 10; ++j) {
                engine.world.add(Factory.Body.polygon(position.set(i - 4.5, j - 2), 3 + i % 3 + j % 2, 0.3, {}, {radius: 0.2}));
            }
        }

        engine.world.add(Factory.Body.circle(new Vector(0, 9), 0.5));

        new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
            stiffness: 0.1,
        })]);

        const runner = new Runner();

        runner.on('update', timestamp => {
            engine.update(timestamp);
        });
        runner.on('render', timestamp => {
            render.update(timestamp.delta);
        });
        runner.runRender();
        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}