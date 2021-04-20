import {
    Body,
    BodyType,
    Engine,
    Factory,
    Mouse,
    MouseConstraint,
    Runner,
    Shape,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';
import { utils } from 'pixi.js';


export default class extends Demo {
    static options = {
        name: 'Conveyor belt',
        fileName: 'ConveyorBelt',
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
            colors: {
                shape: (shape: Shape) => (<Body>shape.body).type === BodyType.static ? utils.rgb2hex([0.4, 0.4, 0.4]) : Render.randomColor(),
                shapeOutline: (shape: Shape) => (<Body>shape.body).type === BodyType.static ? utils.rgb2hex([0.4, 0.4, 0.4]) : utils.rgb2hex([0.8, 0.8, 0.8]),
            }
        });

        engine.world.addBody(Factory.Body.rectangle(new Vector(0, 5), 0, 50, 1, {type: BodyType.static}));

        const conveyorBelt = Factory.Body.rectangle(new Vector(-15, -5), 0, 20, 1, {type: BodyType.static}, {surfaceVelocity: 0.05});
        engine.world.add(conveyorBelt);

        for (let i = 0; i < 5; ++i) {
            engine.world.addBody(Factory.Body.rectangle(new Vector(i * 2 - 20, -8), 0, 1, 1));
        }

        new MouseConstraint(engine, <Mouse><unknown>render.mouse);

        const runner = new Runner();

        let timer = 0;

        runner.events.on('update', timestamp => {
            engine.update(timestamp);

            timer += timestamp.delta;

            if (timer > 1) {
                timer -= 1;
                const radius = Math.round(Math.random() * 2) / 10 + 0.01;
                engine.world.addBody(Factory.Body.polygon(new Vector(-20, -8), Math.ceil(Math.random() * 4) + 3, 0.6 - radius, {}, {radius}));
            }
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