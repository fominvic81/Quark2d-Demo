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
import { Demo } from '../../demo/Demo';


export default class extends Demo {
    static options = {
        name: '1000 circles',
        fileName: 'performance/circles1000',
        sort: 3,
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

        // @ts-ignore
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 30,
            showStatus: true,
        });

        engine.world.add(
            Factory.Body.capsule(new Vector(0, 20), 0, 40, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(0, -20), 0, 40, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(20, 0), Math.PI * 0.5, 40, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(-20, 0), Math.PI * 0.5, 40, 0.5, {type: BodyType.static}),
        );

        for (let i = 0; i < 1000; ++i) {
            engine.world.add(Factory.Body.circle(new Vector((rand() - 0.5) * 35, (rand() - 0.5) * 35), 0.5));
        }

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