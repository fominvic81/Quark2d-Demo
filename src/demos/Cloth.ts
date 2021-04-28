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
        name: 'Cloth',
        fileName: 'Cloth',
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

        const color = utils.rgb2hex([0.6, 0.6, 0.6]);
        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,

            showConstraints: true,
            
            colors: {
                shape: (shape: Shape) => shape.type === ShapeType.CIRCLE ? color : Render.randomColor(),
                shapeOutline: (shape: Shape) => shape.type === ShapeType.CIRCLE ? color : utils.rgb2hex([0.8, 0.8, 0.8]),
                constraint: () => color,
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
                    engine.world.add(new DistanceConstraint({
                        bodyA: body,
                        bodyB: cur[j - 1],
                    }));
                }
                if (i > 0) {
                    engine.world.add(new DistanceConstraint({
                        bodyA: body,
                        bodyB: prev[j],
                    }));
                }

            }
            prev = cur;
            cur = [];
        }

        const circle = Factory.Body.circle(new Vector(-10, 0), 0.8);
        engine.world.add(circle);
        circle.velocity.set(0.8, 0);

        new MouseConstraint(engine, <Mouse><unknown>render.mouse, [new DistanceConstraint({
            stiffness: 0.05,
            damping: 0.02,
        })]);

        const runner = new Runner();

        runner.events.on('update', timestamp => {
            engine.update(timestamp);
        });
        runner.events.on('render', timestamp => {
            render.update(timestamp.delta);
        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}