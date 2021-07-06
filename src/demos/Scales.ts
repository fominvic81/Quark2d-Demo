import {
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Filter,
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
        name: 'Scales',
        fileName: 'Scales',
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
            scale: 40,
        });

        const filter = {group: Filter.nextGroup(true)};

        const body = Factory.Body.rectangle(new Vector(0, 0), 0, 20, 0.5, {velocityDamping: 0.2}, {filter});
        engine.world.add(
            body,
            new DistJoint({
                bodyA: body,
                pointB: body.position,
                stiffness: 1,
            }),
        );

        const platformA = Factory.Body.rectangle(new Vector(-10, -1), 0, 4, 0.5, {}, {filter});
        platformA.setFixedRotation(true);
        engine.world.add(
            platformA,
            new DistJoint({
                bodyA: platformA,
                bodyB: body,
                pointA: new Vector(0, 1),
                pointB: new Vector(-10, 0),
                stiffness: 1,
            }),
        );
        const platformB = Factory.Body.rectangle(new Vector(10, -1), 0, 4, 0.5, {}, {filter});
        platformB.setFixedRotation(true);
        engine.world.add(
            platformB,
            new DistJoint({
                bodyA: platformB,
                bodyB: body,
                pointA: new Vector(0, 1),
                pointB: new Vector(10, 0),
                stiffness: 1,
            }),
        );

        engine.world.add(
            Factory.Body.rectangle(new Vector(-9, 3), 0, 1, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(9, 3), 0, 1, 1, {type: BodyType.static}),

            Factory.Body.rectangle(new Vector(-10.5, -2), 0, 1, 1),
            Factory.Body.rectangle(new Vector(-9.5, -2), 0, 1, 1),
            Factory.Body.rectangle(new Vector(-10, -3), 0, 1, 1),

            Factory.Body.rectangle(new Vector(10.5, -2), 0, 1, 1),
            Factory.Body.rectangle(new Vector(9.5, -2), 0, 1, 1),
        );

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