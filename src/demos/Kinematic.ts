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
        name: 'Kinematic bodies',
        fileName: 'Kinematic',
        info: 'Press left/right arrow to move wrecking ball',
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
            scale: 15,

            colors: {
                shape: (shape: Shape) =>
                (<Body>shape.body).type === BodyType.static ? utils.rgb2hex([0.4, 0.4, 0.4]) :
                (<Body>shape.body).type === BodyType.kinematic ? utils.rgb2hex([0.4, 0.4, 0.8]) :
                shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) :
                Render.randomColor(),
                shapeOutline: (shape: Shape) =>
                (<Body>shape.body).type === BodyType.static ? utils.rgb2hex([0.4, 0.4, 0.4]) :
                shape.type === ShapeType.EDGE ? utils.rgb2hex([0.4, 0.4, 0.4]) :
                utils.rgb2hex([0.8, 0.8, 0.8]),
            }
        });

        // Add walls
        engine.world.add([
            Factory.Body.rectangle(new Vector(0, 20), 0, 60, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(0, -20), 0, 60, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(30, 0), 0, 1, 40, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(-30, 0), 0, 1, 40, {type: BodyType.static}),

            Factory.Body.rectangle(new Vector(-22.5, -5), 0, 15, 1, {type: BodyType.static}),
            Factory.Body.rectangle(new Vector(22.5, -5), 0, 15, 1, {type: BodyType.static}),

            Factory.Body.rectangle(new Vector(-15.5, 10), 0, 1, 20, {type: BodyType.static}),
        ]);

        const platform = Factory.Body.rectangle(new Vector(12.5, -5) ,0, 5, 1, {type: BodyType.kinematic}, {friction: 5});
        engine.world.add(platform);

        // Add boxes on platform
        engine.world.add([
            Factory.Body.rectangle(new Vector(12.5, -7), 0, 0.9, 0.9, {}, {friction: 5}),
            Factory.Body.rectangle(new Vector(13, -6), 0, 0.9, 0.9, {}, {friction: 5}),
            Factory.Body.rectangle(new Vector(12, -6), 0, 0.9, 0.9, {}, {friction: 5}),
        ]);

        let dir = 1;

        const mixer = new Body({type: BodyType.kinematic, position: new Vector(-22.5, 13)});
        mixer.addShape(Factory.Shape.rectangle(12, 0.8));
        mixer.addShape(Factory.Shape.rectangle(0.8, 12));

        mixer.angularVelocity = 0.02;

        engine.world.add(mixer);

        // Add boxes and circles to mixer
        for (let i = -28; i <= -17; ++i) {
            for (let j = -3; j < 8; ++j) {
                if (i % 2) {
                    engine.world.add(Factory.Body.rectangle(new Vector(i, j), 0, 0.9, 0.9));
                } else {
                    engine.world.add(Factory.Body.circle(new Vector(i, j), 0.5));
                }
            }
        }

        const group = Filter.nextGroup(true);

        const crane = Factory.Body.rectangle(new Vector(-10, 0), 0, 1.5, 1.5, {type: BodyType.kinematic}, {filter: {group}});
        engine.world.add(crane);

        let craneDir = 0;

        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowLeft':
                    craneDir = -1;
                    break;
                case 'ArrowRight':
                    craneDir = 1;
                    break;
            }
        });
        window.addEventListener('keyup', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') craneDir = 0;
        });

        // Add wrecking ball
        let bodyA = Factory.Body.capsule(new Vector(-10, 0.5), Math.PI * 0.5, 1, 0.25, {}, {filter: {group}});
        engine.world.add(bodyA);

        engine.world.add(new DistanceConstraint({
            bodyA,
            bodyB: crane,
            pointA: new Vector(-0.5, 0),
            stiffness: 1,
        }));

        for (let i = 0; i < 15; ++i) {
            const bodyB = Factory.Body.capsule(new Vector(-10, i + 1.5), Math.PI * 0.5, 1, 0.25, {}, {filter: {group}});
            engine.world.add(bodyB);

            engine.world.add(new DistanceConstraint({
                bodyA,
                bodyB,
                pointA: new Vector(0.5, 0),
                pointB: new Vector(-0.5, 0),
                stiffness: 1,
            }));

            bodyA = bodyB;
        }

        const ball = Factory.Body.circle(new Vector(-10, 16), 1.5, {}, {filter: {group: group}});
        ball.setDensity(800);
        engine.world.add(ball);

        engine.world.add(new DistanceConstraint({
            bodyA,
            bodyB: ball,
            pointA: new Vector(0.5, 0),
            stiffness: 1,
        }));

        // Add boxed
        for (let i = 3; i < 10; ++i) {
            for (let j = 7; j < 20; ++j) {
                engine.world.add(Factory.Body.rectangle(new Vector(i, j), 0, 0.9, 0.9));
            }
        }

        new MouseConstraint(engine, <Mouse><unknown>render.mouse, [new DistanceConstraint({
            stiffness: 0.001,
            damping: 0.02,
        })]);

        const runner = new Runner();

        let timer = 0.5;

        runner.events.on('update', timestamp => {
            engine.update(timestamp);

            timer += timestamp.delta;
            if (timer > 1) {
                if (platform.position.x * dir > 12.5) {
                    dir = -dir;
                    timer = 0;
                }
                platform.velocity.set(Math.cos((platform.position.x * 0.95) / 12.5 * Math.PI / 2) * dir * 0.15, 0);
            } else {
                platform.velocity.set(0, 0);
            }

            crane.velocity.set(craneDir * 0.15, 0);
            
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