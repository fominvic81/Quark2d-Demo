import { Engine, Runner } from 'quark2d';
import { Render } from 'quark2d-pixi';

export abstract class Demo {
    options = {
        name: 'name',
        info: '',
    };

    abstract create (element: HTMLElement): {engine: Engine, runner: Runner, render: Render};

    getUrl () {
        return `https://github.com/fominvic81/Quark2d-Demo/blob/master/src/demos/${this.options.name}`;
    }
}