import {
    Body,
    BodyType,
    Circle,
    Convex,
    Edge,
    Shape,
    ShapeType,
    Vector,
} from 'quark2d';

interface ShapeJson {
    type: ShapeType;
    radius: number;
    restitution: number;
    friction: number;
    density: number;
    isSensor: boolean;
}

interface CircleJson extends ShapeJson {
    offset: {x: number, y: number};
}

interface ConvexJson extends ShapeJson {
    vertices: {x: number, y: number}[];
}

interface EdgeJson extends ShapeJson {
    start: {x: number, y: number};
    end: {x: number, y: number};
}

interface BodyJson {
    type: BodyType;
    fixedRotation: boolean;
    shapes: string[];
}

export const circleToJson = (circle: Circle) => {
    const offset = circle.body ? Vector.subtract(circle.position, circle.body.center, new Vector()) : circle.position.copy();

    const obj: CircleJson = {
        type: circle.type,
        offset,
        radius: circle.radius,
        restitution: circle.restitution,
        friction: circle.friction,
        density: circle.density,
        isSensor: circle.isSensor,
    }

    return JSON.stringify(obj);
}

export const convexToJson = (convex: Convex) => {

    const vertices: Vector[] = [];

    for (const vertex of convex.vertices) {
        const newVertex = vertex.copy();
        if (convex.body) newVertex.subtract(convex.body.center);
        vertices.push(newVertex);
    }

    const obj: ConvexJson = {
        type: convex.type,
        radius: convex.radius,
        restitution: convex.restitution,
        friction: convex.friction,
        density: convex.density,
        isSensor: convex.isSensor,
        vertices,
    }

    return JSON.stringify(obj);
}

export const edgeToJson = (edge: Edge) => {

    const start = edge.body ? edge.start.copy().subtract(edge.body.center) : edge.start.copy();
    const end = edge.body ? edge.end.copy().subtract(edge.body.center) : edge.end.copy();

    const obj: EdgeJson = {
        type: edge.type,
        radius: edge.radius,
        restitution: edge.restitution,
        friction: edge.friction,
        density: edge.density,
        isSensor: edge.isSensor,
        start,
        end,
    }

    return JSON.stringify(obj);
}

export const shapeToJson = (shape: Shape) => {
    switch (shape.type) {
        case ShapeType.CIRCLE:
            return circleToJson(<Circle>shape);
        case ShapeType.CONVEX:
            return convexToJson(<Convex>shape);
        case ShapeType.EDGE:
            return edgeToJson(<Edge>shape)
    }
    return '';
}

export const bodyToJson = (body: Body) => {
    const shapes: string[] = [];

    for (const shape of body.shapes) {
        shapes.push(shapeToJson(shape));
    }

    const obj: BodyJson = {
        type: body.type,
        fixedRotation: body.inverseInertia === 0,
        shapes,
    }

    return JSON.stringify(obj);
}

export const jsonToCircle = (json: string) => {
    const obj: CircleJson = JSON.parse(json);
    const circle = new Circle(obj);
    circle.position.x = obj.offset.x;
    circle.position.y = obj.offset.y;

    return circle;
}

export const jsonToConvex = (json: string) => {
    const obj: ConvexJson = JSON.parse(json);

    const vertices: Vector[] = [];

    for (const vertex of obj.vertices) {
        vertices.push(new Vector(vertex.x, vertex.y));
    }
    obj.vertices = vertices;

    // @ts-ignore
    const convex = new Convex(obj);

    return convex;
}

export const jsonToEdge = (json: string) => {
    const obj: EdgeJson = JSON.parse(json);

    obj.start = new Vector(obj.start.x, obj.start.y);
    obj.end = new Vector(obj.end.x, obj.end.y);
    // @ts-ignore
    const edge = new Edge(obj);

    return edge;
}

export const jsonToShape = (json: string) => {
    const obj: ShapeJson = JSON.parse(json);
    switch (obj.type) {
        case ShapeType.CIRCLE:
            return jsonToCircle(json);
        case ShapeType.CONVEX:
            return jsonToConvex(json);
        case ShapeType.EDGE:
            return jsonToEdge(json);
    }
    throw new Error();
}

export const jsonToBody = (json: string) => {
    const obj: BodyJson = JSON.parse(json);
    
    const body = new Body(obj);

    for (const shape of obj.shapes) {
        body.addShape(jsonToShape(shape));
    }

    body.setFixedRotation(obj.fixedRotation);

    return body;
}