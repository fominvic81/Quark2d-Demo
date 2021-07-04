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
import { utils } from 'pixi.js';


export default class extends Demo {
    static options = {
        name: 'Drawing',
        fileName: 'Drawing',
        info: [
            'Press \'d\' to draw terrain',
            'Press \'f\' to draw polygon(avoid self-intersections)',
            'Press \'g\' to draw circle',
        ],
        sort: 0,
    }
    engine: Engine;
    runner: Runner;
    render: Render;

    constructor(element: HTMLElement) {
        super(element);

        const engine = new Engine();
        engine.sleeping.setType(SleepingType.NO_SLEEPING);

        // @ts-ignore
        const render = new Render(engine, element, {
            width: element.clientWidth,
            height: element.clientHeight,
            scale: 40,
        });

        engine.world.add(Factory.Body.rectangle(new Vector(0, 10), 0, 100, 1, {type: BodyType.static}));

        let drawTerrain = false;
        let drawPolygon = false;
        let drawCircle = false;

        const lastPosition = new Vector();

        let polygon: Vector[] = [];

        const circlePosition = new Vector();
        let circleRadius = 0;

        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'd':
                    if (drawPolygon || drawCircle) return;

                    render.mouse.position.clone(lastPosition);
                    drawTerrain = !drawTerrain;
                    break;
                case 'f':
                    if (drawTerrain || drawCircle) return;

                    if (drawPolygon) {
                        const polygonBody = Factory.Body.fromVertices(new Vector(0, 0), polygon);
                        if (polygonBody.mass && polygonBody.inertia) engine.world.add(polygonBody);
                        else console.warn('avoid self-intersections');
                        polygon = [];
                    } else {
                        polygon.push(render.mouse.position.copy());
                    }
                    drawPolygon = !drawPolygon;
                    break;
                case 'g':
                    if (drawPolygon || drawTerrain) return;

                    if (drawCircle) {
                        if (circleRadius !== 0) {
                            engine.world.add(Factory.Body.circle(circlePosition, circleRadius));
                        }
                    } else {
                        circleRadius = 0;
                        render.mouse.position.clone(circlePosition);
                    }
                    drawCircle = !drawCircle;
                    break;
            }
        });

        render.mouse.on('mouse-move', () => {
            if (drawTerrain && Vector.distSquared(render.mouse.position, lastPosition) > 0.1) {

                const body = new Body({type: BodyType.static});
                body.addShape(new Edge({start: lastPosition, end: render.mouse.position, radius: 0.2}));
                engine.world.add(body);

                render.mouse.position.clone(lastPosition);

            } else if (drawPolygon && Vector.distSquared(render.mouse.position, polygon[polygon.length - 1]) > 0.1) {

                polygon.push(render.mouse.position.copy());

            } else if (drawCircle) {

                circleRadius = Vector.dist(render.mouse.position, circlePosition);

            }
        });

        new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
            stiffness: 0.1,
        })]);

        const runner = new Runner();

        runner.on('update', timestamp => {
            engine.update(timestamp);
        });
        runner.on('render', timestamp => {
            render.update(timestamp.delta);

            render.userGraphics.clear();

            if (drawPolygon) {
                render.userGraphics.lineStyle(0.04, utils.rgb2hex([1, 1, 1]));

                render.userGraphics.moveTo(polygon[0].x, polygon[0].y);
                for (let i = 1; i < polygon.length; ++i) {
                    render.userGraphics.lineTo(polygon[i].x, polygon[i].y);
                }
                render.userGraphics.lineTo(polygon[0].x, polygon[0].y);
            } else if (drawCircle) {
                render.userGraphics.beginFill(utils.rgb2hex([0.2, 1, 0.6]));
                render.userGraphics.drawCircle(circlePosition.x, circlePosition.y, circleRadius);
                render.userGraphics.endFill();
            }
        });
        runner.runRender();


        this.engine = engine;
        this.runner = runner;
        this.render = render;
    }
}