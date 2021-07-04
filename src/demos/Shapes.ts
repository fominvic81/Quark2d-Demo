import {
    Body,
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Mouse,
    MouseJoint,
    Runner,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';


export default class extends Demo {
    static options = {
        name: 'Shapes',
        fileName: 'Shapes',
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

        engine.world.add(Factory.Body.rectangle(new Vector(0, 5), 0, 30, 1, {type: BodyType.static}));

        // rectangle
        engine.world.addBody(Factory.Body.rectangle(new Vector(-10, 2), 0, 1, 1));
        // triangle
        engine.world.addBody(Factory.Body.polygon(new Vector(-8, 2), 3, 0.3, {}, {radius: 0.3}));
        // pentagon
        engine.world.addBody(Factory.Body.polygon(new Vector(-6, 2), 5, 0.5, {}, {radius: 0.1}));
        // octagon
        engine.world.addBody(Factory.Body.polygon(new Vector(-4, 2), 8, 0.7));
        // ellipse
        engine.world.addBody(Factory.Body.ellipse(new Vector(-2, 2), 0.8, 0.5, 6, {}, {radius: 0.1}));
        // capsule
        engine.world.addBody(Factory.Body.capsule(new Vector(0, 2), 0, 1, 0.5));
        // circle
        engine.world.addBody(Factory.Body.circle(new Vector(2, 2), 0.6));

        // cross
        const cross = new Body({position: new Vector(4, 2)});
        cross.addShape(Factory.Shape.rectangle(1.5, 0.4));
        cross.addShape(Factory.Shape.rectangle(0.4, 1.5));
        engine.world.add(cross);

        // arrow
        const arrow = Factory.Body.fromVertices(new Vector(6, 2), [
            new Vector(0, -1),
            new Vector(0.8, 0.2),
            new Vector(0.2, -0.2),
            new Vector(0.2, 1),
            new Vector(-0.2, 1),
            new Vector(-0.2, -0.2),
            new Vector(-0.8, 0.2),
        ]);
        engine.world.add(arrow);

        // container
        const container = new Body({position: new Vector(9, 2)});
        container.addShape(Factory.Shape.rectangle(0.2, 1.5), new Vector(1.4, 0));
        container.addShape(Factory.Shape.rectangle(0.2, 1.5), new Vector(-1.4, 0));
        container.addShape(Factory.Shape.rectangle(3, 0.2), new Vector(0, 0.75));
        engine.world.add(container);

        // circles
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 3; ++j) {
                engine.world.add(Factory.Body.circle(new Vector(8 + i / 3 * 2 + ((j % 2 - 0.5) * 0.05), -j * 0.5 + 2), 0.25));
            }
        }

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