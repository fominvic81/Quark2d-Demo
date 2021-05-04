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
        name: 'Constraints',
        fileName: 'Constraints',
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
            showConstraints: true,
        });

        engine.world.add(
            Factory.Body.capsule(new Vector(0, 15), 0, 30, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(0, -15), 0, 30, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(15, 0), 0.5 * Math.PI, 30, 0.5, {type: BodyType.static}),
            Factory.Body.capsule(new Vector(-15, 0), 0.5 * Math.PI, 30, 0.5, {type: BodyType.static}),
        );

        const body1 = new Body({position: new Vector(-10, -10)});
        body1.addShape(Factory.Shape.rectangle(8, 0.8));
        body1.addShape(Factory.Shape.rectangle(0.8, 8));
        engine.world.add(body1);

        engine.world.add(new DistanceConstraint({
            bodyA: body1,
            pointB: new Vector(-10, -10),
            stiffness: 1,
        }));

        engine.world.add(Factory.Body.rectangle(new Vector(-7, -12), 0, 1, 1));

        const body2 = Factory.Body.rectangle(new Vector(-2, -7), 0, 1, 1);
        engine.world.add(body2);

        engine.world.add(new DistanceConstraint({
            bodyA: body2,
            pointA: new Vector(0.2, 0.2),
            pointB: new Vector(-2, -10),
            stiffness: 0.001,
        }));

        const body3 = Factory.Body.rectangle(new Vector(2, -7), 0, 1, 1);
        engine.world.add(body3);

        engine.world.add(new DistanceConstraint({
            bodyA: body3,
            pointA: new Vector(-0.3, 0),
            pointB: new Vector(0, -10),
            stiffness: 0.1,
        }));
        engine.world.add(new DistanceConstraint({
            bodyA: body3,
            pointA: new Vector(0.3, 0),
            pointB: new Vector(4, -10),
            stiffness: 0.1,
        }));

        const body4 = Factory.Body.polygon(new Vector(5, -5), 6, 0.7);
        engine.world.add(body4);

        engine.world.add(new DistanceConstraint({
            bodyA: body4,
            pointB: new Vector(5, -10),
            stiffness: 0.001,
            damping: 0.1,
        }));

        const body5 = Factory.Body.rectangle(new Vector(0, 0), 0, 0.8, 10);
        engine.world.add(body5);

        body5.velocity.set(0.1, 0),

        engine.world.add(new DistanceConstraint({
            bodyA: body5,
            pointA: new Vector(0, -4.5),
            pointB: new Vector(0, -4.5),
            stiffness: 0.5,
        }));

        const body6 = Factory.Body.rectangle(new Vector(0, 13), 0, 12, 0.8);
        engine.world.add(body6);

        engine.world.add(new DistanceConstraint({
            bodyA: body6,
            pointB: new Vector(0, 13),
            stiffness: 1,
        }));

        engine.world.add(
            Factory.Body.rectangle(new Vector(-5, 10), 0, 0.9, 0.9),
            Factory.Body.rectangle(new Vector(-5, 11), 0, 0.9, 0.9),
            Factory.Body.rectangle(new Vector(-5, 12), 0, 0.9, 0.9),
            Factory.Body.rectangle(new Vector(5, 10), 0, 0.9, 0.9),
            Factory.Body.rectangle(new Vector(5, 11), 0, 0.9, 0.9),
            Factory.Body.rectangle(new Vector(5, 12), 0, 0.9, 0.9),
        );

        new MouseConstraint(engine, <Mouse><unknown>render.mouse, [new DistanceConstraint({
            stiffness: 0.001,
            damping: 0.02,
        })]);

        const runner = new Runner();

        runner.events.on('update', timestamp => {
            engine.update(timestamp);
        });
        runner.events.on('render', timestamp => {
            render.update(timestamp.delta);
        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}