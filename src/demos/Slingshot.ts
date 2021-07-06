import { Graphics, utils } from 'pixi.js';
import {
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Mouse,
    MouseJoint,
    Pair,
    Ray,
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';

const getTrajectoryPoint = (start: Vector, velocity: Vector, gravity: Vector, i: number, output: Vector) => {
    return output.set(
        start.x + i * velocity.x + (i * i + i) * gravity.x / 2,
        start.y + i * velocity.y + (i * i + i) * gravity.y / 2,
    );
}

export default class extends Demo {
    static options = {
        name: 'Slingshot',
        fileName: 'Slingshot',
        info: '',
        sort: 0,
    }
    engine: Engine;
    runner: Runner;
    render: Render;

    constructor (element: HTMLElement) {
        super(element);

        const engine = new Engine({solverOptions: {iterations: 20}});
        engine.sleeping.setType(SleepingType.NO_SLEEPING);

        // @ts-ignore
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 25,
            translate: new Vector(0, 10),
        });

        const slingshotPosition = new Vector(-10, 0);
        const curSlingshotPosition = slingshotPosition.copy();
        const jointOffset = 3;
        const offset = new Vector();
        const radius = 0.5;
        const density = 30;
        const maxDist = 3;
        const velocityCoef = 0.25;
        let holding = false;

        engine.world.add(Factory.Body.capsule(new Vector(0, 3), 0, 500, 0.2, {type: BodyType.static}));
        
        for (let i = 0; i < 5; ++i) {
            engine.world.add(
                Factory.Body.rectangle(new Vector(10, -i * 3), 0, 2.5, 0.5),
                Factory.Body.rectangle(new Vector(9, -i * 3 + 1.5), 0, 0.5, 2.5),
                Factory.Body.rectangle(new Vector(11, -i * 3 + 1.5), 0, 0.5, 2.5),
            );
        }

        engine.world.add(Factory.Body.polygon(new Vector(10, -13), 3, 1.5));

        engine.world.add(Factory.Body.capsule(new Vector(18, -10), 0, 5, 0.2, {type: BodyType.static}));

        for (let i = 0; i < 4; ++i) {
            engine.world.add(
                Factory.Body.rectangle(new Vector(18, -i * 3 - 13), 0, 2.5, 0.5),
                Factory.Body.rectangle(new Vector(17, -i * 3 - 11.5), 0, 0.5, 2.5),
                Factory.Body.rectangle(new Vector(19, -i * 3 - 11.5), 0, 0.5, 2.5),
            );
        }
        engine.world.add(Factory.Body.polygon(new Vector(18, -23), 3, 1.5));

        const targetSpeed = 0.3;
        const targetCenter = new Vector(10, -32);
        const target = Factory.Body.capsule(targetCenter, 0, 3, 0.5, {type: BodyType.kinematic});
        target.velocity.x = targetSpeed;

        engine.world.add(target);

        engine.on('started-collisions', (event) => {
            const pairs = <Pair[]>event.pairs;

            for (const pair of pairs) {
                if (pair.shapeA.body === target || pair.shapeB.body === target) {
                    target.setType(BodyType.dynamic);
                }
            }
        });

        render.mouse.on('mouse-down', () => {
            if (Vector.distSquared(render.mouse.position, slingshotPosition) < Math.pow(radius, 2)) {
                Vector.subtract(slingshotPosition, render.mouse.position, offset);
                holding = true;
            }
        });
        render.mouse.on('mouse-move', () => {
            if (holding) {
                const targetPos = Vector.add(render.mouse.position, offset, Vector.temp[0]);

                Vector.interpolate(slingshotPosition, targetPos, 0.4, curSlingshotPosition);

                if (Vector.distSquared(slingshotPosition, curSlingshotPosition) > Math.pow(maxDist, 2)) {
                    const delta = Vector.subtract(curSlingshotPosition, slingshotPosition, Vector.temp[1]).normalise().scale(maxDist);

                    Vector.add(slingshotPosition, delta, curSlingshotPosition);
                }
            }
        });

        render.mouse.on('mouse-up', () => {
            if (holding) {
                holding = false;
                const velocity = Vector.subtract(slingshotPosition, curSlingshotPosition, new Vector()).scale(velocityCoef);

                const projectile = Factory.Body.circle(curSlingshotPosition, radius, {}, {density});
                velocity.clone(projectile.velocity);

                engine.world.add(projectile);


                slingshotPosition.clone(curSlingshotPosition);
            }
        });

        new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
            stiffness: 0.1,
        })]);

        const runner = new Runner();

        runner.on('update', timestamp => {
            engine.update(timestamp);

            if (target.type === BodyType.kinematic) {
                if (target.center.x - targetCenter.x > 15) {
                    target.velocity.x = -targetSpeed;
                } else if (target.center.x - targetCenter.x < -15) {
                    target.velocity.x = targetSpeed;
                }
            }
        });

        const ray = new Ray();
        
        const circleSprite = new Graphics();

        circleSprite.beginFill(utils.rgb2hex([0.3, 0.3, 0.3]));
        const path: number[] = [];

        const count = 100 * radius;
        for (let i = 0; i < count; ++i) {
            path.push(Math.cos(i / count * Math.PI * 2) * radius, Math.sin(i / count * Math.PI * 2) * radius);
        }

        circleSprite.drawPolygon(path);
        circleSprite.endFill();

        render.stage.addChild(circleSprite);

        runner.on('render', timestamp => {
            render.update(timestamp.delta);

            render.userGraphics.clear();

            render.userGraphics.lineStyle(0.1, utils.rgb2hex([0.3, 0.3, 0.3]));

            render.userGraphics.moveTo(slingshotPosition.x, slingshotPosition.y + jointOffset)
            for (let i = 1; i <= 30; ++i) {
                let t = i / 30;
                const x = (curSlingshotPosition.x * t + slingshotPosition.x * (1 - t)) * t + (slingshotPosition.x * t + slingshotPosition.x * (1 - t)) * (1 - t);
                const y = (curSlingshotPosition.y * t + slingshotPosition.y * (1 - t)) * t + (slingshotPosition.y * t + (slingshotPosition.y + jointOffset) * (1 - t)) * (1 - t);

                render.userGraphics.lineTo(x, y);
            }

            circleSprite.position.x = curSlingshotPosition.x;
            circleSprite.position.y = curSlingshotPosition.y;

            if (holding) {
                const temp = new Vector();
                const velocity = Vector.subtract(slingshotPosition, curSlingshotPosition, new Vector()).scale(velocityCoef);

                const prevPosition = curSlingshotPosition.copy();
                const g = engine.gravity.scaleOut(Math.pow(runner.options.fixedDelta, 2), new Vector());

                render.userGraphics.lineStyle(0.03, utils.rgb2hex([0.2, 0.8, 0.1]));
                render.userGraphics.moveTo(prevPosition.x, prevPosition.y);

                const contactPoint = new Vector();
                for (let i = 1; i <= 250; ++i) {

                    const position = getTrajectoryPoint(curSlingshotPosition, velocity, g, i, temp);

                    prevPosition.clone(ray.from);
                    position.clone(ray.to);

                    const result = ray.cast(engine, true, true);

                    let minFraction = Infinity;
                    for (const intersection of result.intersections) {
                        if (intersection.fraction < minFraction) {
                            minFraction = intersection.fraction;
                            intersection.point.clone(contactPoint);
                        }
                    }

                    if (minFraction === Infinity) {
                        render.userGraphics.lineTo(position.x, position.y);
                    } else {
                        render.userGraphics.lineTo(contactPoint.x, contactPoint.y);
                        break;
                    }

                    position.clone(prevPosition);
                }
            }


        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}