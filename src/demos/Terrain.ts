import {
    Body,
    BodyType,
    DistJoint,
    Edge,
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

const createLine = (start: Vector, end: Vector) => {
    const body = new Body({type: BodyType.static});
    body.addShape(new Edge({start, end, radius: 0.1}));
    return body;
}

export default class extends Demo {
    static options = {
        name: 'Terrain',
        fileName: 'Terrain',
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

        const prevPosition = new Vector();
        const position = new Vector();

        for (let i = -51; i <= 50; ++i) {

            position.x = i;
            position.y = Math.sin((i - 7.5) * 0.2) + Math.cos((i - 6) * 0.3) + 8;
            if (i > -51) engine.world.add(createLine(prevPosition, position));

            position.clone(prevPosition);
        }

        for (let i = -4; i <= 4; ++i) {
            for (let j = -2; j <= 2; ++j) {
                engine.world.add(Factory.Body.rectangle(new Vector(i, j), 0, 1, 1),)
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