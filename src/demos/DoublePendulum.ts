import {
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
        name: 'Double pendulum',
        fileName: 'DoublePendulum',
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

        engine.solver.options.jointIterations = 5;

        const filter = {group: Filter.nextGroup(true)};

        const bodyA = Factory.Body.capsule(new Vector(0, -5), Math.PI * 0.5, 10, 0.5, {}, {filter});
        const bodyB = Factory.Body.capsule(new Vector(0, 5), Math.PI * 0.5, 10, 0.5, {}, {filter});

        engine.world.add(bodyA, bodyB);

        engine.world.add(new DistJoint({
            bodyA,
            bodyB,
            pointA: new Vector(5, 0),
            pointB: new Vector(-5, 0),
            stiffness: 0.5,
        }));

        engine.world.add(new DistJoint({
            bodyA,
            pointA: new Vector(-5, 0),
            pointB: new Vector(0, bodyA.position.y - 5),
            stiffness: 0.5,
        }));

        bodyA.velocity.set(0.6, 0);
        bodyA.angularVelocity = -0.1;

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