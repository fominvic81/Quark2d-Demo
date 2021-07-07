import { App } from '../App';
import { Demo } from '../demo/Demo';

export abstract class Plugin {
    app: App;
    demo: Demo;

    constructor (app: App) {
        this.app = app;
        this.demo = app.demo;
    }

    onChangeDemo (demo: Demo) {
        this.demo = demo;
    }
}

export type PluginConstructor = new (app: App) => Plugin;