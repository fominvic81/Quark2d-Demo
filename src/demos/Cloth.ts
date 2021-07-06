import {
    Body,
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Filter,
    Mouse,
    MouseJoint,
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
        name: 'Cloth',
        fileName: 'Cloth',
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

        const color = utils.rgb2hex([0.6, 0.6, 0.6]);
        // @ts-ignore
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,

            showJoints: true,

            colors: {
                shape: (shape: Shape) => shape.type === ShapeType.CIRCLE ? color : undefined,
                shapeOutline: (shape: Shape) => shape.type === ShapeType.CIRCLE ? color : undefined,
                joint: () => color,
            }
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 12), 0, 30, 1, {type: BodyType.static}));

        const filter = {group: Filter.nextGroup(true)};

        let prev: Body[] = [];
        let cur: Body[] = [];

        const width = 20;
        const height = 20;
        for (let i = 0; i < width; ++i) {
            for (let j = 0; j < height; ++j) {

                const body = Factory.Body.circle(new Vector((i - width * 0.5) * 0.5, (j - height * 0.5) * 0.5), 0.15, {type: j === 0 ? BodyType.static : BodyType.dynamic}, {filter});
                engine.world.add(body);

                cur.push(body);

                if (j > 0) {
                    engine.world.add(new DistJoint({
                        bodyA: body,
                        bodyB: cur[j - 1],
                        stiffness: 0.25,
                    }));
                }
                if (i > 0) {
                    engine.world.add(new DistJoint({
                        bodyA: body,
                        bodyB: prev[j],
                        stiffness: 0.25,
                    }));
                }

            }
            prev = cur;
            cur = [];
        }

        const circle = Factory.Body.circle(new Vector(-10, 0), 0.8);
        engine.world.add(circle);
        circle.velocity.set(0.8, 0);

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