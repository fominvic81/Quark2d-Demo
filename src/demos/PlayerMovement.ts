import {
    Body,
    BodyType,
    DistJoint,
    Edge,
    Engine,
    Factory,
    Filter,
    Mouse,
    MouseJoint,
    Pair,
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';

const createLine = (start: Vector, end: Vector) => {
    const body = new Body({type: BodyType.static});
    body.addShape(new Edge({start, end, radius: 0.1}));
    return body;
}
const createCurve = (p1: Vector, p2: Vector, p3: Vector, quality: number) => {
    const body = new Body({type: BodyType.static});
    
    const prevPoint = p3.copy();
    const point = new Vector();

    for (let i = 1; i <= quality; ++i) {
        const t = i / quality;
        point.set(
            (p1.x * t + p2.x * (1 - t)) * t + (p2.x * t + p3.x * (1 - t)) * (1 - t),
            (p1.y * t + p2.y * (1 - t)) * t + (p2.y * t + p3.y * (1 - t)) * (1 - t),
        );
        body.addShape(new Edge({start: prevPoint, end: point, radius: 0.1}));
        point.clone(prevPoint);
    }
    return body;
}

export default class extends Demo {
    static options = {
        name: 'Simple player movement',
        fileName: 'PlayerMovement',
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
            scale: 40,
        });

        // Height must be bigger than wigth
        const playerHeight = 2;
        const playerWidth = 1;

        const playerSpeed = 0.15;
        const playerAccCoef = 0.2;

        const playerSpeedAir = 0.05;
        const playerAccCoefAir = 0.05;

        const jumpHeight = 2.5;
        const jumpDelay = 1/15;

        const player = new Body({position: new Vector(0, 10)});

        const playerCapsuleShape = Factory.Shape.capsule(playerHeight - playerWidth, playerWidth * 0.5, {friction: 0, restitution: 0});
        player.addShape(playerCapsuleShape, new Vector(), Math.PI * 0.5 + 0.001);

        const playerBottomSensorShape = Factory.Shape.capsule(0.3, 0.03, {isSensor: true});
        player.addShape(playerBottomSensorShape, new Vector(0, playerHeight * 0.5));

        player.setFixedRotation(true);
        engine.world.add(player);

        let movement = 0;

        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'a':
                case 'ArrowLeft':
                    movement = -1;
                    break;
                case 'd':
                case 'ArrowRight':
                    movement = 1;
                    break;
                case 'ArrowUp':
                case 'w':
                case ' ':
                    if (onGround && jumpTimer < 0) {
                        // 1/(2g) * v^2 + 0.5 * v + h = 0;

                        const g = -engine.gravity.y * Math.pow(runner.options.fixedDelta, 2);

                        const a = 0.5/g;
                        const b = 0.5;
                        const c = jumpHeight;

                        const det = b * b - 4 * a * c;

                        const detSqrt = Math.sqrt(det);

                        const v1 = (-b - detSqrt) / (2 * a);
                        const v2 = (-b + detSqrt) / (2 * a);

                        const v = Math.max(v1, v2);

                        player.velocity.y = -v;
                        jumpTimer = jumpDelay;
                    }
                    break;
            }
        });
        window.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'a':
                case 'ArrowLeft':
                    if (movement === -1) movement = 0;
                    break;
                case 'd':
                case 'ArrowRight':
                    if (movement === 1) movement = 0;
                    break;
            }
        });

        let jumpTimer = 0;
        let onGround = false;
        const groundNormal = new Vector();
        engine.on('active-collisions', (event) => {
            const pairs = <Pair[]>event.pairs;
            groundNormal.set(0, 1);
            onGround = false;
            for (const pair of pairs) {
                if (pair.shapeA === playerBottomSensorShape) {
                    onGround = true;
                    if (pair.normal.y < groundNormal.y) {
                        pair.normal.clone(groundNormal);
                    }
                } else if (pair.shapeB === playerBottomSensorShape) {
                    onGround = true;
                    if (-pair.normal.y < groundNormal.y) {
                        pair.normal.negOut(groundNormal);
                    }
                }
            }
        });

        new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
            stiffness: 0.1,
        })]);

        const runner = new Runner();

        runner.on('update', (timestamp) => {
            engine.update(timestamp);
        });
        const acceleration = new Vector();
        runner.on('after-update', (timestamp) => {
            jumpTimer -= timestamp.delta;
            acceleration.set(0, 0);

            player.setAngle(player.angle + (movement * 0.1 - player.angle) * 0.2);
            if (onGround) {
                const tanget = groundNormal.rotate270Out(Vector.temp[0]);
                tanget.scaleOut((movement * playerSpeed - Vector.dot(player.velocity, tanget)) * playerAccCoef * Math.pow(groundNormal.y, 4), acceleration);
            } else {//
                acceleration.x = (movement * playerSpeedAir - player.velocity.x) * playerAccCoefAir;

                jumpTimer = jumpDelay;
            }
            player.velocity.add(acceleration);
        });

        runner.on('before-render', () => {
            // Move camera to player's position.
            Vector.interpolate(render.translate.negOut(Vector.temp[0]), player.position, 0.1, render.translate).neg();
        });
        runner.on('render', (timestamp) => {
            render.update(timestamp.delta);
        });
        runner.runRender();

        engine.world.add(
            createCurve(new Vector(-5, 15), new Vector(-30, 15), new Vector(-30, 5), 20),
            createLine(new Vector(-5, 15), new Vector(5, 15)),
            createLine(new Vector(5, 15), new Vector(12, 10)),
            createLine(new Vector(12, 10), new Vector(25, 10)),
            createCurve(new Vector(25, 10), new Vector(35, 5), new Vector(40, 10), 20),

            createLine(new Vector(80.7, 10), new Vector(85, 10)),
            createLine(new Vector(85, 10), new Vector(85, 0)),
        );

        for (let i = 0; i < 5; ++i) {
            engine.world.add(Factory.Body.rectangle(new Vector(-2, 14 - i), 0, 1, 1));
        }
        for (let i = 0; i < 2; ++i) {
            for (let j = 0; j < 6; ++j) {
                engine.world.add(Factory.Body.rectangle(new Vector(60 - 3 + j, 9 - i), 0, 1, 1));
            }
        }

        const bridgeStart = new Vector(41.3, 10);

        const filter = {group: Filter.nextGroup(true)};

        let bodyA: Body | undefined;
        for (let i = 0; i < 20; ++i) {

            const bodyB = Factory.Body.capsule(new Vector(i * 2, 0).add(bridgeStart), 0, 2, 0.1, {velocityDamping: 0.02}, {filter, mass: 1000});
            engine.world.add(bodyB);

            const joint = new DistJoint({
                bodyA,
                bodyB,
                pointA: bodyA ? new Vector(1, 0) : new Vector(bodyB.position.x - 1, bodyB.position.y),
                pointB: new Vector(-1, 0),
                stiffness: 0.5,
            });
            engine.world.add(joint);

            bodyA = bodyB;
        }
        const joint = new DistJoint({
            bodyA,
            pointA: new Vector(1, 0),
            pointB: new Vector(bodyA!.position.x + 1, bodyA!.position.y),
            stiffness: 0.5,
        });
        engine.world.add(joint);
        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}