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
        name: 'Stacking',
        fileName: 'Stacking',
        info: '',
        sort: 0,
    }
    engine: Engine;
    runner: Runner;
    render: Render;
    mouseJoint: MouseJoint;

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

        engine.world.add(Factory.Body.rectangle(new Vector(0, 12), 0, 30, 1, {type: BodyType.static}));

        for (let i = 0; i < 10; ++i) {
            engine.world.add(Factory.Body.rectangle(new Vector(-5, 10 - i * 1.2), 0, 1, 1, {}, {restitution: 0.5, radius: 0.1}));
        }

        for (let i = 0; i < 12; ++i) {
            engine.world.add(Factory.Body.circle(new Vector(5, 10 - i), 0.5));
        }

        const mouseJoint = new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
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
        this.mouseJoint = mouseJoint;
    }
}