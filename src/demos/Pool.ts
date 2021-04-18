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


export default class Pool extends Demo {
    options = {
        name: 'Pool',
        info: '',
    }

    create (element: HTMLElement) {

        const engine = new Engine();
        engine.sleeping.type = SleepingType.NO_SLEEPING;

        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
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
        runner.run();

        return {
            engine,
            render,
            runner,
        }
    }
}