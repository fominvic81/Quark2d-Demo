import {
    Body,
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
        name: 'Pyramid',
        fileName: 'Pyramid',
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

        engine.world.add(Factory.Body.rectangle(new Vector(0, 12), 0, 50, 1, {type: BodyType.static}))

        for (let i = 12; i >= 0; --i) {
            for (let j = 0; j <= i; ++j) {
                const body = new Body();
                body.setPosition(new Vector(j * 1.05 - i * 0.525, i * 1.05 - 2));

                const shape = Factory.Shape.rectangle(0.9, 0.9, {restitution: 0, friction: 10, radius: 0.05});
                body.addShape(shape);
                engine.world.add(body);
            }
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