import {
    Body,
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
        name: 'Tumbler',
        fileName: 'Tumbler',
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

        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 35,
        });

        const tumbler = new Body({type: BodyType.kinematic});
        tumbler.angularVelocity = 0.01;

        tumbler.addShape(Factory.Shape.rectangle(30, 1), false, new Vector(0, 15));
        tumbler.addShape(Factory.Shape.rectangle(30, 1), false, new Vector(0, -15));
        tumbler.addShape(Factory.Shape.rectangle(1, 30), false, new Vector(15, 0));
        tumbler.addShape(Factory.Shape.rectangle(1, 30), true, new Vector(-15, 0));

        engine.world.add(tumbler);

        new MouseConstraint(engine, <Mouse><unknown>render.mouse, [new DistanceConstraint({
            stiffness: 0.001,
            damping: 0.02,
        })]);

        const runner = new Runner();

        let count = 0;
        let timer = 0;

        runner.events.on('update', timestamp => {
            engine.update(timestamp);

            if (count < 200) {
                timer += timestamp.delta;

                if (timer > 0.1) {
                    timer -= 0.1;
                    const radius = Math.round(Math.random() * 2) / 10;
                    engine.world.addBody(Factory.Body.polygon(new Vector(), Math.ceil(Math.random() * 4) + 3, 0.6 - radius, {}, {radius}));
                    ++count;
                }
            }
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