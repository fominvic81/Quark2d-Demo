import {
    Body,
    BodyType,
    DistanceConstraint,
    Engine,
    Factory,
    Mouse,
    MouseConstraint,
    Runner,
    Shape,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';


export default class extends Demo {
    static options = {
        name: 'Sensor',
        fileName: 'Sensor',
        info: '',
    }
    engine: Engine;
    runner: Runner;
    render: Render;

    constructor (element: HTMLElement) {
        super(element);

        const engine = new Engine();
        engine.gravity.set(0, 5);
        engine.sleeping.setType(SleepingType.NO_SLEEPING);

        const render = new Render(engine, {
            element: element,
            width: element.clientWidth,
            height: element.clientHeight,
        });

        const sensor = Factory.Body.circle(new Vector(), 4, {type: BodyType.static}, {isSensor: true});
        engine.world.add(sensor);

        engine.world.add(Factory.Body.rectangle(new Vector(0, 10), 0, 50, 1, {type: BodyType.static}));

        for (let i = -8; i <= 8; ++i) {
            engine.world.add(Factory.Body.circle(new Vector(i * 1.1, -5), 0.5));
        }

        engine.events.on('active-collisions', (event) => {
            for (const pair of event.pairs) {
                const sensorShape: Shape | undefined = pair.isSensor ? (pair.shapeA.isSensor ? pair.shapeA : pair.shapeB) : undefined;
                if (!sensorShape) continue;

                const anotherShape: Shape = sensorShape === pair.shapeA ? pair.shapeB : pair.shapeA;

                const delta = Vector.subtract(sensorShape.position, anotherShape.position, Vector.temp[0]);
                const dist = Math.max(delta.length(), 0.01);

                const diff = 4.5 - dist;

                const impulse = delta.divide(dist).scale(diff * 0.005);

                (<Body>anotherShape.body).velocity.add(impulse);
            }
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
            render.update();
        });
        runner.runRender();

        
        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}