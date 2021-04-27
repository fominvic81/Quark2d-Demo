import {
    DistanceConstraint,
    Engine,
    Factory,
    Mouse,
    MouseConstraint,
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
    }
    engine: Engine;
    runner: Runner;
    render: Render;

    constructor (element: HTMLElement) {
        super(element);

        const engine = new Engine();
        engine.sleeping.setType(SleepingType.NO_SLEEPING);
        engine.gravity.set(0, 0);

        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,
        });

        for (let i = -7; i <= 7; ++i) {
            for (let j = -5; j <= 5; ++j) {
                if (Math.random() < 0.1) {
                    engine.world.add(Factory.Body.circle(new Vector(i * 2.5, j * 2.5), 0.5));
                } else {
                    engine.world.add(Factory.Body.polygon(new Vector(i * 2.5, j * 2.5), Math.round(Math.pow(Math.random(), 2) * 3) + 3, 0.5));
                }
            }
        }

        const count = 256;
        const length = 20;
        const step = Math.PI * 2 / count;
        const cos = Math.cos(step);
        const sin = Math.sin(step);
        const ray = new Ray();
        let minDist = Infinity;
        const contactPoint = new Vector();

        render.mouse.events.on('mouse-move', () => {
            ray.setFrom(render.mouse.position);
        });

        new MouseConstraint(engine, <Mouse><unknown>render.mouse, [new DistanceConstraint({
            stiffness: 0.001,
            damping: 0.02,
        })]);

        const runner = new Runner();

        runner.events.on('update', timestamp => {
            engine.update(timestamp);
        });

        runner.events.on('render', timestamp => {
            render.update(timestamp.delta);

            render.userGraphics.clear()
            render.userGraphics.lineStyle(0.08, utils.rgb2hex([1, 0, 0]));
            const delta = new Vector(length, 0);

            for (let i = 0; i < count; ++i) {
                const x = delta.x;
                const y = delta.y;

                delta.x = x * cos - y * sin;
                delta.y = x * sin + y * cos;
                
                const to = Vector.add(ray.from, delta, Vector.temp[0]);

                to.clone(contactPoint);
                minDist = Math.pow(length, 2);

                ray.setTo(to);
                
                const result = ray.cast(engine, engine.world, false);

                for (const intersection of result.intersections.values()) {
                    if (!intersection.isActive) continue;

                    for (let j = 0; j < intersection.contactsCount; ++j) {
                        const contact = intersection.contacts[j];

                        const dist = Vector.distSquared(ray.from, contact.point);

                        if (dist < minDist) {
                            minDist = dist;
                            contact.point.clone(contactPoint);
                        }
                    }
                }

                render.userGraphics.moveTo(ray.from.x, ray.from.y);
                render.userGraphics.lineTo(contactPoint.x, contactPoint.y);
            }
        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}