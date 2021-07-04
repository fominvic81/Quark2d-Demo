import {
    BodyType,
    DistJoint,
    Engine,
    Factory,
    Filter,
    Mouse,
    MouseJoint,
    Runner,
    Shape,
    SleepingType,
    Vector,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';
import { utils } from 'pixi.js';


export default class extends Demo {
    static options = {
        name: 'Collision filtering',
        fileName: 'Filtering',
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

        const defaultCategory = Filter.nextCategory(engine);
        const redCategory = Filter.nextCategory(engine);
        const greenCategory = Filter.nextCategory(engine);
        const blueCategory = Filter.nextCategory(engine);

        const def = {
            category: defaultCategory,
            mask: defaultCategory | redCategory | greenCategory | blueCategory
        };


        const redGround = {
            category: redCategory,
            mask: defaultCategory | greenCategory | blueCategory,
        };
        const greenGround = {
            category: greenCategory,
            mask: defaultCategory | redCategory | blueCategory,
        };
        const blueGround = {
            category: blueCategory,
            mask: defaultCategory | redCategory | greenCategory,
        };


        const redBody = {
            category: redCategory,
            mask: defaultCategory | redCategory | greenCategory | blueCategory,
        };
        const greenBody = {
            category: greenCategory,
            mask: defaultCategory | redCategory | greenCategory | blueCategory,
        };
        const blueBody = {
            category: blueCategory,
            mask: defaultCategory | redCategory | greenCategory | blueCategory,
        };

        // @ts-ignore
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 20,

            colors: {
                shape: (shape: Shape) =>
                    (shape.filter.category === redCategory) ? utils.rgb2hex([1, 0, 0]) :
                    (shape.filter.category === greenCategory) ? utils.rgb2hex([0, 1, 0]) :
                    (shape.filter.category === blueCategory) ? utils.rgb2hex([0, 0, 1]) :
                    (shape.filter.category === defaultCategory) ? utils.rgb2hex([0.8, 0.8, 0.8]) :
                    Render.randomColor(),
            }
        });

        const angle = Math.PI * 0.15;
        const length = 8;
        const startX = -25;
        const startY = -18;
        const deltaX = Math.cos(angle) * length;
        const deltaY = Math.sin(angle) * length;

        engine.world.addBody(
            Factory.Body.rectangle(new Vector(startX + deltaX, startY + deltaY), angle, length, 1, {type: BodyType.static}, {filter: redGround}),
            Factory.Body.rectangle(new Vector(startX + deltaX * 3, startY + deltaY * 3), angle, length, 1, {type: BodyType.static}, {filter: greenGround}),
            Factory.Body.rectangle(new Vector(startX + deltaX * 5, startY + deltaY * 5), angle, length, 1, {type: BodyType.static}, {filter: blueGround}),
        );

        for (let i = 0; i < 4; ++i) {
            engine.world.addBody(Factory.Body.rectangle(new Vector(startX + deltaX * i * 2, startY + deltaY * i * 2), angle, length, 1, {type: BodyType.static}, {filter: def}));
        }

        for (let i = 0.5; i < 4.5; ++i) {
            engine.world.addBody(Factory.Body.rectangle(new Vector(startX + deltaX * i * 2, startY + deltaY * i * 2 + 20), angle, length, 1, {type: BodyType.static}, {filter: def}));
        }

        for (let i = 0; i < 7; ++i) {
            engine.world.addBody(Factory.Body.rectangle(new Vector(startX + deltaX * (i + 0.5), startY + deltaY * (i + 0.5) + 10), 0, 1, 20, {type: BodyType.static}, {filter: def}))
        }

        engine.world.addBody(Factory.Body.rectangle(new Vector(startX + deltaX * 7.5, startY + deltaY * 7.5 + 5), 0, 1, 30, {type: BodyType.static}, {filter: def}))

        new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
            stiffness: 0.1,
        })]);

        const runner = new Runner();

        let timer = 0;

        runner.on('update', timestamp => {
            engine.update(timestamp);

            timer += timestamp.delta;

            if (timer > 0.5) {
                timer -= 0.5;

                let filter;
                let rand = Math.random() * 4;

                if (rand < 1) {
                    filter = def;
                } else if (rand < 2) {
                    filter = redBody;
                } else if (rand < 3) {
                    filter = greenBody;
                } else if (rand < 4) {
                    filter = blueBody;
                }

                engine.world.add(Factory.Body.rectangle(new Vector(startX + deltaX * 0.25, startY - 3), 0, 1, 1, {}, {
                    filter,
                    radius: 0.1,
                }));
            }
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