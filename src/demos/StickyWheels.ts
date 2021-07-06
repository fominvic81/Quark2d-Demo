import {
    Body,
    BodyType,
    Circle,
    CircleOptions,
    DistJoint,
    Edge,
    Engine,
    Factory,
    Filter,
    Mouse,
    MouseJoint,
    Pair,
    Runner,
    SleepingState,
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
const createCurve = (p1: Vector, p2: Vector, p3: Vector, quality: number) => {
    const body = new Body({type: BodyType.static});
    
    const prevPoint = p3.copy();
    const point = new Vector();

    for (let i = 1; i <= quality; ++i) {
        const t = i / quality;
        point.set(
            (p1.x * t + p2.x * (1 - t)) * t + (p2.x * t + p3.x * (1 - t)) * (1 - t),
            (p1.y * t + p2.y * (1 - t)) * t + (p2.y * t + p3.y * (1 - t)) * (1 - t),
        );

        body.addShape(new Edge({start: prevPoint, end: point, radius: 0.1}));
        point.clone(prevPoint);
    }
    return body;
}

interface StickyWheelData {
    isSticky: boolean;
    circle: Circle;
    sensorCircle: Circle;
    pair?: Pair;
}

interface StickyWheelSensorData {
    isStickyWheelSensor: boolean;
}

const createStickWheel = (position: Vector, radius: number, circleOptions: CircleOptions = {}) => {
    circleOptions.friction = Infinity;
    circleOptions.restitution = 0;
    circleOptions.radius = radius;
    const circle = new Circle(circleOptions);
    circleOptions.radius = radius * 1.2;
    circleOptions.isSensor = true;
    const sensorCircle = new Circle<StickyWheelSensorData>(circleOptions, {isStickyWheelSensor: true});

    const body = new Body<StickyWheelData>({position}, {isSticky: true, circle, sensorCircle});

    body.addShape(circle);
    body.addShape(sensorCircle);

    return body;
}


export default class extends Demo {
    static options = {
        name: 'Sticky wheels',
        fileName: 'StickyWheels',
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
            translate: new Vector(3, 4),
        });

        engine.world.add(
            createLine(new Vector(-5, 5), new Vector(5, 5)),
            createCurve(new Vector(5, 5), new Vector(15, 5), new Vector(15, 0), 20),
            createCurve(new Vector(15, 0), new Vector(15, -5), new Vector(5, -5), 20),
            createCurve(new Vector(5, -5), new Vector(0, -5), new Vector(0, -10), 20),
            createCurve(new Vector(0, -10), new Vector(0, -15), new Vector(-10, -15), 20),
            createCurve(new Vector(-10, -15), new Vector(-20, -15), new Vector(-20, -5), 20),
            createCurve(new Vector(-20, -5), new Vector(-20, 5), new Vector(-5, 5), 20),
        );

        const carPosition = new Vector(0, 4);

        const filter = {group: Filter.nextGroup(true)};
        
        const carSize = 1;
        const car = Factory.Body.fromVertices(carPosition, [
            new Vector(-1.5 * carSize, -0.2 * carSize),
            new Vector(-1.2 * carSize, -0.9 * carSize),
            new Vector(0.0, -0.9 * carSize),
            new Vector(1.5 * carSize, 0.0),
            new Vector(1.5 * carSize, 0.5 * carSize),
            new Vector(-1.5 * carSize, 0.5 * carSize),
        ], {}, {filter});
        
        const backWheel = createStickWheel(new Vector(-1 * carSize, 0.5 * carSize).add(carPosition), 0.4 * carSize, {filter});
        const frontWheel = createStickWheel(new Vector(1 * carSize, 0.5 * carSize).add(carPosition), 0.4 * carSize, {filter});

        const frontJoint = new DistJoint({
            bodyA: car,
            bodyB: frontWheel,
            pointA: Vector.subtract(frontWheel.center, car.center, new Vector()),
            stiffness: 1,
        });
    
        const backJoint = new DistJoint({
            bodyA: car,
            bodyB: backWheel,
            pointA: Vector.subtract(backWheel.center, car.center, new Vector()),
            stiffness: 1,
        });

        engine.world.add(car, backWheel, frontWheel, backJoint, frontJoint);


        const stickyWheels: Set<Body<StickyWheelData>> = new Set();

        engine.on('active-collisions', (event) => {
            const pairs = <Pair[]>event.pairs;
            stickyWheels.clear();

            for (const pair of pairs) {
                let stickyWheel: Body<StickyWheelData> | undefined;
                
                if (pair.shapeA.userData?.isStickyWheelSensor) {
                    stickyWheel = pair.shapeA.body;
                } else if (pair.shapeB.userData?.isStickyWheelSensor) {
                    stickyWheel = pair.shapeB.body;
                }

                if (stickyWheel) {
                    if (
                        (stickyWheel.userData!.pair && pair.contacts[0].depth > stickyWheel.userData!.pair.contacts[0].depth) ||
                        !stickyWheel.userData!.pair
                    ) {
                        stickyWheel.userData!.pair = pair;
                    }
                    stickyWheels.add(stickyWheel);
                }
            }

            for (const wheel of stickyWheels) {
                const pair = wheel.userData!.pair!;
                wheel.userData!.pair = undefined;

                let sibiling: Body;
                
                if (pair.shapeA.userData?.isStickyWheelSensor) {
                    sibiling = pair.shapeB.body!;
                } else {
                    sibiling = pair.shapeA.body!;
                }

                const contact = pair.contacts[0];

                const normalCrossA = contact.offsetA.x * pair.normal.y - contact.offsetA.y * pair.normal.x;
                const normalCrossB = contact.offsetB.x * pair.normal.y - contact.offsetB.y * pair.normal.x;
                const share = 1 / (
                    wheel.inverseMass +
                    sibiling.inverseMass +
                    wheel.inverseInertia * normalCrossA * normalCrossA +
                    sibiling.inverseInertia * normalCrossB * normalCrossB
                );

                const normalImpulse = (wheel.userData!.sensorCircle.radius - wheel.userData!.circle.radius - contact.depth + 0.02) * share;

                const impulseX = normalImpulse * pair.normal.x;
                const impulseY = normalImpulse * pair.normal.y;

                wheel.velocity.x += impulseX * wheel.inverseMass;
                wheel.velocity.y += impulseY * wheel.inverseMass;
                wheel.angularVelocity += (contact.offsetA.x * impulseY - contact.offsetA.y * impulseX) * wheel.inverseInertia;
                wheel.positionBias.x += impulseX * wheel.inverseMass;
                wheel.positionBias.y += impulseY * wheel.inverseMass;
                wheel.positionBiasAngle += (contact.offsetA.x * impulseY - contact.offsetA.y * impulseX) * wheel.inverseInertia;

                if (sibiling.type === BodyType.dynamic && sibiling.sleepState !== SleepingState.SLEEPING) {
                    sibiling.velocity.x -= impulseX * sibiling.inverseMass;
                    sibiling.velocity.y -= impulseY * sibiling.inverseMass;
                    sibiling.angularVelocity -= (contact.offsetB.x * impulseY - contact.offsetB.y * impulseX) * sibiling.inverseInertia;

                    sibiling.positionBias.x -= impulseX * sibiling.inverseMass;
                    sibiling.positionBias.y -= impulseY * sibiling.inverseMass;
                    sibiling.positionBiasAngle -= (contact.offsetB.x * impulseY - contact.offsetB.y * impulseX) * sibiling.inverseInertia;
                }
            }
        });

        const mouseJoint = new MouseJoint(engine, <Mouse><unknown>render.mouse, [new DistJoint({
            stiffness: 0.1,
        })]);

        const runner = new Runner();

        runner.on('update', timestamp => {
            backWheel.angularVelocity += Math.min((0.4 - backWheel.angularVelocity), 0.08) * 0.35;
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