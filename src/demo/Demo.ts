import { Engine, Runner } from 'quark2d';
import { Render } from 'quark2d-pixi';

export abstract class Demo {
    static options = {
        name: 'name',
        info: '',
    };
    abstract engine: Engine;
    abstract runner: Runner;
    abstract render: Render;

    constructor (element: HTMLElement) {}

    static getUrl () {
        return `https://github.com/fominvic81/Quark2d-Demo/blob/master/src/demos/${this.options.name}.ts`;
    }
}