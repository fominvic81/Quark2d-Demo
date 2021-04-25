import {
    DistanceConstraint,
    Engine,
    Factory,
    Filter,
    Mouse,
    MouseConstraint,
    PointConstraint,
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
            scale: 40,
        });

        const filter = {group: Filter.nextGroup(true)};

        const bodyA = Factory.Body.capsule(new Vector(0, -5), Math.PI * 0.5, 10, 0.5, {}, {filter});
        const bodyB = Factory.Body.capsule(new Vector(0, 5), Math.PI * 0.5, 10, 0.5, {}, {filter});

        engine.world.add([bodyA, bodyB]);

        engine.world.add(new PointConstraint({
            bodyA,
            bodyB,
            pointA: new Vector(5, 0),
            pointB: new Vector(-5, 0),
            stiffness: 0.5,
        }));

        engine.world.add(new PointConstraint({
            bodyA,
            pointA: new Vector(-5, 0),
            pointB: new Vector(0, bodyA.position.y - 5),
            stiffness: 0.5,
        }));

        bodyA.velocity.set(0.8, 0);

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