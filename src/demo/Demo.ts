import { Engine, MouseJoint, Runner } from 'quark2d';
import { Render } from 'quark2d-pixi';

export abstract class Demo {
    static options: {
        name: string;
        fileName: string;
        info: string | string[];
        sort: number,
    };
    abstract engine: Engine;
    abstract runner: Runner;
    abstract render: Render;
    abstract mouseJoint: MouseJoint;

    constructor (element: HTMLElement) {}

    static getUrl () {
        return `https://github.com/fominvic81/Quark2d-Demo/blob/master/src/demos/${this.options.fileName}.ts`;
    }
}

export type DemoConstructor = new (element: HTMLElement) => Demo;