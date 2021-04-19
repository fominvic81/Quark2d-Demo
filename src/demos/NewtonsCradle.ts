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
        name: 'Newtons cradle',
        fileName: 'NewtonsCradle',
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

            showConstraints: true,
        });
        engine.solver.velocityIterations = 10;

        Factory.Composite.newtonsCradle(new Vector(0, -8), 5, 0.5, 4, 1, 0, engine.world);
        Factory.Composite.newtonsCradle(new Vector(0, 0), 8, 0.4, 3, 1, 0, engine.world);
        Factory.Composite.newtonsCradle(new Vector(0, 8), 5, 0.5, 4, 1, 1, engine.world);

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