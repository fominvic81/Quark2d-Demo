import {
    Engine,
    Runner,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import { DemoByName, Demos } from './demos/Demos';
import Vue from 'vue';
import vueApp from './vue/App.vue';
import { Demo } from './demo/Demo';


export class App {
    demo: {
        engine: Engine,
        render: Render,
        runner: Runner,
    };
    demoName: string;
    vue: Vue;
    paused: boolean = false;
    changeDemo: {(demo: Demo, constr: new (element: HTMLElement) => Demo): void} = () => {};

    constructor () {
        const context = {
            props: {
                demos: Demos,
                callback: (changeDemo: {(demo: Demo, constr: new (element: HTMLElement) => Demo): void}) => {
                    this.changeDemo = changeDemo;
                },
                onSelectDemo: (demo: string) => {
                    this.setDemo(demo);
                },
                onTogglePlay: (value: boolean) => {
                    this.paused = value;
                    this.updatePaused();
                },
                onRestart: () => {
                    this.setDemo(this.demoName);
                },
                onSingleStep: () => {
                    this.paused = true;
                    this.demo.runner.stop();
                    this.demo.engine.update({delta: this.demo.runner.fixedDelta});
                },
                onSetRenderOption: (option: string, value: boolean) => {
                    // @ts-ignore
                    this.demo.render['set' + option[0].toUpperCase() + option.substring(1, option.length)](value);
                },
                onSetSleeping: (type: number) => {
                    this.demo.engine.sleeping.setType(type);
                },
                codeUrl: Demos[0].getUrl(),
            },
        };

        this.vue = new Vue({
            el: '#vue',
            render: h => h(vueApp, context),
        });

        this.demoName = Demos[0].options.name;
        this.demo = new Demos[0](<HTMLElement>document.getElementById('canvas-container'));
        this.changeDemo(this.demo, Demos[0]);
        this.updatePaused();
    }

    setDemo (demo: string) {
        if (this.demo) {
            this.demo.render.renderer.destroy();
            this.demo.render.stage.destroy();
            this.demo.render.mouse.removeListeners();
            this.demo.render.canvas.remove();

            for (const g in this.demo.render) {
                // @ts-ignore
                delete this.demo.render[g];
            }
            this.demo.runner.stop();
            this.demo.runner.stopRender();

            for (const g in this.demo.runner) {
                // @ts-ignore
                delete this.demo.runner[g];
            }
            for (const g in this.demo.engine) {
                // @ts-ignore
                delete this.demo.engine[g];
            }
        }
        this.demo = new (<new (element: HTMLElement) => Demo>DemoByName.get(demo))(<HTMLElement>document.getElementById('canvas-container'));
        this.demoName = (<typeof Demo><unknown>DemoByName.get(demo)).options.name;
        this.changeDemo(this.demo, <new (element: HTMLElement) => Demo>DemoByName.get(demo));
        this.updatePaused();
    }

    updatePaused () {
        if (this.paused) {
            this.demo.runner.stop();
        } else {
            this.demo.runner.run();
        }
    }
}