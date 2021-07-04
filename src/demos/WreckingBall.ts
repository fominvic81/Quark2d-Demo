import {
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Filter,
    Mouse,
    MouseJoint,
    Runner,
    Shape,
    ShapeType,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';
import { utils } from 'pixi.js';


export default class extends Demo {
    static options = {
        name: 'Wrecking ball',
        fileName: 'WreckingBall',
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
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            colors: {
                shape: (shape: Shape) => shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) : undefined,
                shapeOutline: (shape: Shape) => shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) : undefined,
            },
            scale: 30,
        });

        engine.solver.options.jointIterations = 6;

        engine.world.add(Factory.Body.rectangle(new Vector(0, 12), 0, 100, 1, {type: BodyType.static}));

        for (let i = 0; i < 10; ++i) {
            for (let j = 0; j < 15; ++j) {
                engine.world.add(Factory.Body.rectangle(new Vector(i - 8, j - 3), 0, 0.9, 0.9));
            }
        }

        const filter = {group: Filter.nextGroup(true)};

        let bodyA = Factory.Body.capsule(new Vector(-8, -16), 0, 1, 0.25, {}, {filter, density: 800});
        engine.world.add(bodyA);

        engine.world.add(new DistJoint({
            bodyA,
            pointA: new Vector(0.5, 0),
            pointB: new Vector(bodyA.position.x + 0.5, bodyA.position.y),
            stiffness: 1,
        }));

        for (let i = 1; i <= 20; ++i) {
            const bodyB = Factory.Body.capsule(new Vector(-i - 8, -16), 0, 1, 0.25, {}, {filter, density: 800});
            engine.world.add(bodyB);

            engine.world.add(new DistJoint({
                bodyA,
                bodyB,
                pointA: new Vector(-0.5, 0),
                pointB: new Vector(0.5, 0),
                stiffness: 1,
            }));

            bodyA = bodyB;
        }

        const ball = Factory.Body.circle(new Vector(-28.5, -16), 1.5, {}, {filter, density: 800});
        engine.world.add(ball);

        engine.world.add(new DistJoint({
            bodyA,
            bodyB: ball,
            pointA: new Vector(-0.5, 0),
            stiffness: 1,
        }));

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