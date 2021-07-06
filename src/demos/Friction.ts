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
        name: 'Friction',
        fileName: 'Friction',
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
            scale: 25,
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 17), -Math.PI * -0.1, 30, 1, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(0, 7), -Math.PI * -0.1, 30, 1, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(0, -3), -Math.PI * -0.1, 30, 1, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(0, -13), -Math.PI * -0.1, 30, 1, {type: BodyType.static}));

        engine.world.add(Factory.Body.rectangle(new Vector(-12, 10), 0, 1, 1, {}, {friction: 0}));
        engine.world.add(Factory.Body.rectangle(new Vector(-12, 0), 0, 1, 1, {}, {friction: 0.2}));
        engine.world.add(Factory.Body.rectangle(new Vector(-12, -10), 0, 1, 1, {}, {friction: 0.4}));
        engine.world.add(Factory.Body.rectangle(new Vector(-12, -20), 0, 1, 1, {}, {friction: Infinity}));

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