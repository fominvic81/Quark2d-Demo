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
        name: 'Pyramid',
        fileName: 'Pyramid',
        info: '',
    }
    engine: Engine;
    runner: Runner;
    render: Render;


    constructor (element: HTMLElement) {
        super(element);

        const engine = new Engine();
        engine.sleeping.type = SleepingType.NO_SLEEPING;

        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 12), 0, 50, 1, {type: BodyType.static}))

        for (let i = 12; i >= 0; --i) {
            for (let j = 0; j <= i; ++j) {
                const body = new Body();
                body.setPosition(new Vector(j * 1.1 - i * 0.55, i * 1.1 - 3));

                const shape = Factory.Shape.rectangle(0.9, 0.9, {restitution: 0, friction: Infinity, radius: 0.05});
                body.addShape(shape);
                engine.world.add(body);
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
            render.update();
        });
        runner.runRender();

        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}