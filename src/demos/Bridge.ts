import {
    Body,
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
        name: 'Bridge',
        fileName: 'Bridge',
        info: ['Left mouse button to move bodies', 'Right mouse button to move camera', 'Wheel to zoom'],
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
            scale: 40,
            colors: {
                shape: (shape: Shape) => shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) : undefined,
                shapeOutline: (shape: Shape) => shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) : undefined,
            }
        });

        const filter = {group: Filter.nextGroup(true)};
        engine.world.add(Factory.Body.capsule(new Vector(-30.5, 0), 0, 20, 0.5, {type: BodyType.static}, {filter}));
        engine.world.add(Factory.Body.capsule(new Vector(29.5, 0), 0, 20, 0.5, {type: BodyType.static}, {filter}));

        let bodyA: Body | undefined;
        for (let i = 0; i < 20; ++i) {

            const bodyB = Factory.Body.capsule(new Vector(i * 2 - 19.5, 0), 0, 2, 0.5, {velocityDamping: 0.02}, {filter});
            engine.world.add(bodyB);

            const joint = new DistJoint({
                bodyA,
                bodyB,
                pointA: bodyA ? new Vector(1, 0) : new Vector(bodyB.position.x - 1, bodyB.position.y),
                pointB: new Vector(-1, 0),
                stiffness: 1,
            });
            engine.world.add(joint);

            bodyA = bodyB;
        }
        const joint = new DistJoint({
            bodyA,
            pointA: new Vector(1, 0),
            pointB: new Vector(bodyA!.position.x + 1, bodyA!.position.y),
            stiffness: 1,
        });
        engine.world.add(joint);

        for (let i = 0; i < 8; ++i) {
            for (let j = 0; j < 6; ++j) {
                engine.world.add(Factory.Body.rectangle(new Vector(i - 4.5, j - 6), 0, 1, 1));
            }
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