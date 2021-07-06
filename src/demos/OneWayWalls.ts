import {
    Body,
    BodyType,
    Convex,
    DistJoint,
    Engine,
    Factory,
    Mouse,
    MouseJoint,
    Pair,
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';

interface OneWayWallData {
    isOWW: boolean;
    normal: Vector;
}

const createOneWayWall = (position: Vector, angle: number, width: number, height: number, isKinematic: boolean = false) => {


    const shape = new Convex({
        vertices: [
            new Vector(-0.5 * width, -0.5 * height),
            new Vector(0.5 * width, -0.5 * height),
            new Vector(0.5 * width, 0.2 * height),
            new Vector(0, 0.5 * height),
            new Vector(-0.5 * width, 0.2 * height),
        ],
        isSensor: true,
    });

    const normal = new Vector(0, -1).rotate(angle);

    const body = new Body<OneWayWallData>({position, type: isKinematic ? BodyType.kinematic : BodyType.static}, {isOWW: true, normal});
    body.addShape(shape, new Vector(), angle);

    return body;
}

export default class extends Demo {
    static options = {
        name: 'One way walls',
        fileName: 'OneWayWalls',
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

        engine.world.add(createOneWayWall(new Vector(0, 8), 0, 14, 1));

        engine.world.add(createOneWayWall(new Vector(0, 2.5), 0, 5, 1));
        engine.world.add(createOneWayWall(new Vector(0, -2.5), 0, 5, 1));
        engine.world.add(createOneWayWall(new Vector(2.5, 0), -Math.PI * 0.5, 5, 1));
        engine.world.add(createOneWayWall(new Vector(-2.5, 0), Math.PI * 0.5, 5, 1));


        const box1 = Factory.Body.rectangle(new Vector(0, 5), 0, 1, 1);
        box1.velocity.y = -0.16;
        const box2 = Factory.Body.rectangle(new Vector(5, -1), 0, 1, 1);
        box2.velocity.x = -0.16;
        const box3 = Factory.Body.rectangle(new Vector(5, 15), 0, 1, 1);
        box3.velocity.x = -0.07;
        box3.velocity.y = -0.22;
        engine.world.add(box1, box2, box3);


        const p: Set<number> = new Set();

        engine.on('active-collisions', (event) => {
            const pairs = <Pair[]>event.pairs;
            for (const pair of pairs) {
                if (p.has(pair.id)) continue;
                if (pair.shapeB.body?.userData?.isOWW) {
                    if (Vector.dot(pair.normal, pair.shapeB.body!.userData!.normal!) < -0.1) {
                        engine.manager.pairsToSolve.push(pair);
                        for (let i = 0; i < pair.contactsCount; ++i) {
                            engine.manager.contactsToSolve.push(pair.contacts[i]);
                        }
                    } else {
                        p.add(pair.id);
                    }
                }
            }
        });
        engine.on('ended-collisions', (event) => {
            const pairs = <Pair[]>event.pairs;
            for (const pair of pairs) {
                p.delete(pair.id);
            }
        });

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