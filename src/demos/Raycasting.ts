import {
    DistJoint,
    Engine,
    Factory,
    Mouse,
    MouseJoint,
    Ray,
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';
import { utils } from 'pixi.js';


export default class extends Demo {
    static options = {
        name: 'Raycasting',
        fileName: 'Raycasting',
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
        engine.gravity.set(0, 0);

        // @ts-ignore
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,
        });

        for (let i = -7; i <= 7; ++i) {
            for (let j = -5; j <= 5; ++j) {
                const r = Math.random();
                if (r < 0.1) {
                    engine.world.add(Factory.Body.circle(new Vector(i * 2.5, j * 2.5), 0.5));
                } else if (r < 0.3) {
                    engine.world.add(Factory.Body.capsule(new Vector(i * 2.5, j * 2.5), 0, 0.4, 0.3));
                } else {
                    engine.world.add(Factory.Body.polygon(new Vector(i * 2.5, j * 2.5), Math.round(Math.pow(Math.random(), 2) * 3) + 3, 0.4, {}, {radius: Math.random() * 0.2 + 0.3}));
                }
            }
        }

        const count = 256;
        const length = 20;
        const step = Math.PI * 2 / count;
        const cos = Math.cos(step);
        const sin = Math.sin(step);
        const ray = new Ray();
        let minFraction = Infinity;
        const points: Vector[] = [];
        const normals: Vector[] = [];

        render.mouse.on('mouse-move', () => {
            render.mouse.position.clone(ray.from);
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

            render.userGraphics.clear()
            const delta = new Vector(length, 0);
            points.length = 0;
            normals.length = 0;

            for (let i = 0; i < count; ++i) {
                const x = delta.x;
                const y = delta.y;

                delta.x = x * cos - y * sin;
                delta.y = x * sin + y * cos;
                
                const to = Vector.add(ray.from, delta, Vector.temp[0]);

                const point = to.copy();
                const normal = new Vector();
                minFraction = 1;

                to.clone(ray.to);

                const result = ray.cast(engine, true, true);

                render.userGraphics.beginFill(utils.rgb2hex([1, 0, 0]))
                for (const intersection of result.intersections) {
                    if (intersection.fraction < minFraction) {
                        minFraction = intersection.fraction;
                        intersection.point.clone(point);
                        intersection.normal.clone(normal);
                    }
                }
                render.userGraphics.endFill();

                points.push(point);
                normals.push(normal);
            }
            
            render.userGraphics.lineStyle(0.05, utils.rgb2hex([1, 0, 0]));
            for (const point of points) {
                render.userGraphics.moveTo(ray.from.x, ray.from.y);
                render.userGraphics.lineTo(point.x, point.y);
            }
            render.userGraphics.lineStyle(0.05, utils.rgb2hex([0, 1, 0]));
            for (let i = 0; i < normals.length; ++i) {
                const normal = normals[i];
                const point = points[i];
                render.userGraphics.moveTo(point.x, point.y);
                render.userGraphics.lineTo(point.x + normal.x * 0.3, point.y + normal.y * 0.3);
            }
        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
        this.mouseJoint = mouseJoint;
    }
}