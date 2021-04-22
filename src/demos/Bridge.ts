import {
    Body,
    BodyType,
    DistanceConstraint,
    Engine,
    Factory,
    Filter,
    Mouse,
    MouseConstraint,
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
        name: 'Bridge',
        fileName: 'Bridge',
        info: ['Left mouse button to move bodies', 'Right mouse button to move camera', 'Wheel to zoom'],
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
            colors: {
                shape: (shape: Shape) => shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) : Render.randomColor(),
                shapeOutline: (shape: Shape) => shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) : utils.rgb2hex([0.8, 0.8, 0.8]),
            }
        });

        const filter = {group: Filter.nextGroup(true)};
        engine.world.add(Factory.Body.capsule(new Vector(-30.5, 0), 0, 20, 0.5, {type: BodyType.static}, {filter}));
        engine.world.add(Factory.Body.capsule(new Vector(29.5, 0), 0, 20, 0.5, {type: BodyType.static}, {filter}));

        const stiffness = 1;
        let bodyA: Body | undefined;
        for (let i = 0; i < 20; ++i) {

            const bodyB = Factory.Body.capsule(new Vector(i * 2 - 19.5, 0), 0, 2, 0.5, {velocityDamping: 0.02}, {filter});
            engine.world.add(bodyB);

                const constraint = new DistanceConstraint({
                    bodyA,
                    bodyB,
                    pointA: bodyA ? new Vector(1, 0) : new Vector(bodyB.position.x - 1, bodyB.position.y),
                    pointB: new Vector(-1, 0),
                    stiffness,
                });
                engine.world.add(constraint);

            bodyA = bodyB;
        }
        const constraint = new DistanceConstraint({
            bodyA,
            pointA: new Vector(1, 0),
            pointB: new Vector((<Body>bodyA).position.x + 1, (<Body>bodyA).position.y),
            stiffness,
        });
        engine.world.add(constraint);

        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 6; ++j) {
                engine.world.add(Factory.Body.rectangle(new Vector(i - 4.5, j - 6), 0, 1, 1));
            }
        }

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