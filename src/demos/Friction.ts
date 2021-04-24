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


export default class extends Demo {
    static options = {
        name: 'Friction',
        fileName: 'Friction',
        info: '',
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
            scale: 25,
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 17), -Math.PI * -0.1, 30, 1, {type: BodyType.static}, {friction: Infinity}));
        engine.world.add(Factory.Body.rectangle(new Vector(0, 7), -Math.PI * -0.1, 30, 1, {type: BodyType.static}, {friction: Infinity}));
        engine.world.add(Factory.Body.rectangle(new Vector(0, -3), -Math.PI * -0.1, 30, 1, {type: BodyType.static}, {friction: Infinity}));
        engine.world.add(Factory.Body.rectangle(new Vector(0, -13), -Math.PI * -0.1, 30, 1, {type: BodyType.static}, {friction: Infinity}));

        engine.world.add(Factory.Body.rectangle(new Vector(-12, 10), 0, 1, 1, {}, {friction: 0}));
        engine.world.add(Factory.Body.rectangle(new Vector(-12, 0), 0, 1, 1, {}, {friction: 0.3}));
        engine.world.add(Factory.Body.rectangle(new Vector(-12, -10), 0, 1, 1, {}, {friction: 0.35}));
        engine.world.add(Factory.Body.rectangle(new Vector(-12, -20), 0, 1, 1, {}, {friction: Infinity}));

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