import {
    Body,
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Mouse,
    MouseJoint,
    Runner,
    Shape,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';
import { utils } from 'pixi.js';


export default class extends Demo {
    static options = {
        name: 'Conveyor belt',
        fileName: 'ConveyorBelt',
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

        engine.world.addBody(Factory.Body.rectangle(new Vector(0, 5), 0, 50, 1, {type: BodyType.static}));

        const conveyorBelt = Factory.Body.rectangle(new Vector(-15, -5), 0, 20, 1, {type: BodyType.static}, {surfaceVelocity: 0.05});
        engine.world.add(conveyorBelt);

        for (let i = 0; i < 5; ++i) {
            engine.world.addBody(Factory.Body.rectangle(new Vector(i * 2 - 20, -8), 0, 1, 1));
        }

        const mouseJoint = new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
            stiffness: 0.1,
        })]);

        const runner = new Runner();

        let timer = 0;

        runner.on('update', timestamp => {
            engine.update(timestamp);

            timer += timestamp.delta;

            if (timer > 1) {
                timer -= 1;
                const radius = Math.round(Math.random() * 2) / 10 + 0.01;
                engine.world.addBody(Factory.Body.polygon(new Vector(-20, -8), Math.ceil(Math.random() * 4) + 3, 0.6 - radius, {}, {radius}));
            }
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