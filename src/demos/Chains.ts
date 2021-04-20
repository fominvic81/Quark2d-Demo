import {
    BodyType,
    DistanceConstraint,
    Engine,
    Factory,
    Filter,
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
        name: 'Chains',
        fileName: 'Chains',
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
                shape: () => utils.rgb2hex([0.4, 0.4, 0.4]),
                shapeOutline: () => utils.rgb2hex([0.4, 0.4, 0.4]),
            },
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 15), 0, 30, 1, {type: BodyType.static}));

        const circleA = Factory.Body.circle(new Vector(-20, 0), 1);
        engine.world.add(circleA);
        circleA.velocity.set(1, 0);

        const circleB = Factory.Body.circle(new Vector(20, 0), 1);
        engine.world.add(circleB);
        circleB.velocity.set(-1, 0);

        const filterA = {group: Filter.nextGroup(true)};

        let bodyA = Factory.Body.capsule(new Vector(-10, -10), Math.PI * 0.5, 1, 0.25, {}, {filter: filterA});
        engine.world.add(bodyA);

        engine.world.add(new DistanceConstraint({
            bodyA,
            pointA: new Vector(-0.5, 0),
            pointB: new Vector(bodyA.position.x, bodyA.position.y - 0.5),
            stiffness: 1,
            length: 0,
        }));

        for (let i = 1; i <= 20; ++i) {
            const bodyB = Factory.Body.capsule(new Vector(-10, i - 10), Math.PI * 0.5, 1, 0.25, {}, {filter: filterA});
            engine.world.add(bodyB);

            engine.world.add(new DistanceConstraint({
                bodyA,
                bodyB,
                pointA: new Vector(0.5, 0),
                pointB: new Vector(-0.5, 0),
                stiffness: 1,
                length: 0,
            }));

            bodyA = bodyB;
        }

        const filterB = {group: Filter.nextGroup(true)};

        bodyA = Factory.Body.circle(new Vector(0, -10), 0.5, {}, {filter: filterB});
        engine.world.add(bodyA);

        engine.world.add(new DistanceConstraint({
            bodyA,
            pointB: new Vector(bodyA.position.x, bodyA.position.y),
            stiffness: 1,
        }));

        for (let i = 1; i <= 20; ++i) {
            const bodyB = Factory.Body.circle(new Vector(0, i - 10), 0.5, {}, {filter: filterB});
            engine.world.add(bodyB);

            engine.world.add(new DistanceConstraint({
                bodyA,
                bodyB,
                stiffness: 1,
            }));

            bodyA = bodyB;
        }

        const filterC = {group: Filter.nextGroup(true)};

        bodyA = Factory.Body.capsule(new Vector(10, -10), Math.PI * 0.5, 2, 0.5, {}, {filter: filterC});
        engine.world.add(bodyA);

        engine.world.add(new DistanceConstraint({
            bodyA,
            pointA: new Vector(-1, 0),
            pointB: new Vector(bodyA.position.x, bodyA.position.y - 1),
            stiffness: 1,
            length: 0,
        }));

        for (let i = 1; i <= 10; ++i) {
            const bodyB = Factory.Body.capsule(new Vector(10, i * 2 - 10), Math.PI * 0.5, 2, 0.5, {}, {filter: filterC});
            engine.world.add(bodyB);

            engine.world.add(new DistanceConstraint({
                bodyA,
                bodyB,
                pointA: new Vector(1, 0),
                pointB: new Vector(-1, 0),
                stiffness: 0.05,
                length: 0,
            }));

            bodyA = bodyB;
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