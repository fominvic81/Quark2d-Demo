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
        name: 'mixed',
        fileName: 'performance/Mixed',
        sort: 6,
        info: '',
    }
    engine: Engine;
    runner: Runner;
    render: Render;
    mouseJoint: MouseJoint;

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
            scale: 40,
            showStatus: true,
        });

        engine.world.add(
            Factory.Body.capsule(new Vector(0, 15), 0, 30, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(0, -15), 0, 30, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(15, 0), Math.PI * 0.5, 30, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(-15, 0), Math.PI * 0.5, 30, 0.5, {type: BodyType.static}),
        );

        for (let i = 0; i < 500; ++i) {
            const sides = Math.floor(rand() * 8);
            if (sides <= 1) {
                engine.world.add(Factory.Body.circle(new Vector((rand() - 0.5) * 25, (rand() - 0.5) * 25), 0.5));
            } else if (sides === 2) {
                engine.world.add(Factory.Body.capsule(new Vector((rand() - 0.5) * 25, (rand() - 0.5) * 25), 0, 1, rand() * 0.2 + 0.25));
            } else {
                engine.world.add(Factory.Body.polygon(new Vector((rand() - 0.5) * 25, (rand() - 0.5) * 25), sides, 0.5, {}, {radius: 0.1}));
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