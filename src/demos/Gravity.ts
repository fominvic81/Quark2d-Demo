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
import { utils } from 'pixi.js';


export default class extends Demo {
    static options = {
        name: 'Gravity',
        fileName: 'Gravity',
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

        // @ts-ignore
        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 10), 0, 20, 1, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(0, -10), 0, 20, 1, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(10, 0), 0, 1, 20, {type: BodyType.static}));
        engine.world.add(Factory.Body.rectangle(new Vector(-10, 0), 0, 1, 20, {type: BodyType.static}));

        for (let i = -6; i <= 6; ++i) {
            for (let j = -6; j <= 6; ++j) {
                engine.world.add(Factory.Body.polygon(new Vector(i, j), (i + 7) % 2 + (j + 7) % 2 + Math.abs(i * j) % 3 + 3, 0.5));
            }
        }

        new MouseConstraint(engine, <Mouse><unknown>render.mouse, [new DistanceConstraint({
            stiffness: 0.001,
            damping: 0.02,
        })]);

        const runner = new Runner();

        runner.events.on('update', timestamp => {
            engine.update(timestamp);

            engine.gravity.rotate(timestamp.delta * Math.PI * 0.2);
        });
        runner.events.on('render', timestamp => {
            render.update(timestamp.delta);

            // Clear canvas
            render.userGraphics.clear();

            // Draw arrow
            render.userGraphics.lineStyle(0.1, utils.rgb2hex([1, 0, 0]));
            render.userGraphics.moveTo(0, 0)
            .lineTo(engine.gravity.x * 0.2, engine.gravity.y * 0.2)
            .lineTo(engine.gravity.x * 0.2 - engine.gravity.y * 0.04, engine.gravity.y * 0.2 + engine.gravity.x * 0.04)
            .lineTo(engine.gravity.x * 0.24, engine.gravity.y * 0.24)
            .lineTo(engine.gravity.x * 0.2 + engine.gravity.y * 0.04, engine.gravity.y * 0.2 - engine.gravity.x * 0.04)
            .lineTo(engine.gravity.x * 0.2, engine.gravity.y * 0.2);
        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}