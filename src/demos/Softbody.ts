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
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';
import { utils } from 'pixi.js';

const softRect = (position: Vector, rows: number, columns: number, stiffness: number, radius: number) => {
    const output = [];
    let prev: Body[] = [];
    let cur: Body[] = [];

    const d = radius * 2;

    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < columns; ++j) {
            const body = Factory.Body.circle(new Vector((i - rows * 0.5) * d, (j - columns * 0.5) * d).add(position), radius, {}, {friction: 10});
            output.push(body);
            cur.push(body);

            if (j > 0) {
                output.push(new DistJoint({
                    bodyA: body,
                    bodyB: cur[j - 1],
                    stiffness,
                }));
            }
            if (i > 0) {
                output.push(new DistJoint({
                    bodyA: body,
                    bodyB: prev[j],
                    stiffness,
                }));
            }
            if (i > 0 && j < columns - 1) {
                output.push(new DistJoint({
                    bodyA: body,
                    bodyB: prev[j + 1],
                    stiffness,
                }));
            }
            if (i > 0 && j > 0) {
                output.push(new DistJoint({
                    bodyA: body,
                    bodyB: prev[j - 1],
                    stiffness,
                }));
            }
        }
        prev = cur;
        cur = [];
    }
    return output;
}

const softCircle = (position: Vector, radius: number, stiffness: number, count: number) => {
    const output = [];

    const filter = {group: Filter.nextGroup(true)};
    const center = Factory.Body.circle(position, radius / 4);
    output.push(center);

    const delta = new Vector(radius, 0);
    const step = Math.PI * 2 / count;
    const cos = Math.cos(step);
    const sin = Math.sin(step);

    const prevPos = delta.copy().add(position);
    const pos = new Vector();

    let first;
    let prev;
    const offset = new Vector();
    const prevOffset = new Vector();

    for (let i = 0; i < count; ++i) {
        const x = delta.x;
        const y = delta.y;

        delta.x = x * cos - y * sin;
        delta.y = x * sin + y * cos;

        Vector.add(position, delta, pos);

        const body = new Body();
        const shape = <Edge>body.addShape(new Edge({
            start: prevPos,
            end: pos,
            radius: 0.2,
            filter,
        }));
        output.push(body);

        Vector.subtract(shape.start, shape.position, offset);

        output.push(new DistJoint({
            bodyA: center,
            bodyB: body,
            pointB: offset,
            stiffness,
        }));

        if (i === 0) {
            first = body;
        } else if (prev) {
            output.push(new DistJoint({
                bodyA: body,
                bodyB: prev,
                pointA: offset,
                pointB: prevOffset.neg(),
                stiffness: 0.5,
            }));
        }
        if (i === count - 1) {
            output.push(new DistJoint({
                bodyA: body,
                bodyB: first,
                pointA: Vector.subtract(shape.end, shape.position, offset),
                pointB: offset.copy().set(offset.x, -offset.y),
                stiffness: 0.5,
            }));
        }

        offset.clone(prevOffset);
        prev = body;
        pos.clone(prevPos);
    }

    return output;
}

export default class extends Demo {
    static options = {
        name: 'Soft body',
        fileName: 'Softbody',
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

            colors: {
                shape: () => utils.rgb2hex([0.4, 0.4, 0.4]),
                shapeOutline: () => utils.rgb2hex([0.4, 0.4, 0.4]),
            }
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 15), 0, 200, 2, {type: BodyType.static}));
        const circle = Factory.Body.circle(new Vector(-10, -3), 1);
        circle.velocity.set(1.5, 0);
        engine.world.add(circle)

        engine.world.add(...softCircle(new Vector(0, -15), 5, 0.08, 30));
        engine.world.add(...softRect(new Vector(2, 0), 5, 15, 0.08, 0.5));


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