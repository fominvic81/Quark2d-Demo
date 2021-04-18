import {
    Engine,
    Runner
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

    constructor () {

        const context = {
            props: {
                demos: Demos,
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
                codeUrl: Demos[0].getUrl(),
            },
        };

        this.vue = new Vue({
            el: '#vue',
            render: h => h(vueApp, context),
        });

        this.demoName = Demos[0].options.name;
        this.demo = Demos[0].create(<HTMLElement>document.getElementById('canvas-container'));
    }

    setDemo (demo: string) {
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
        this.demo = (<Demo>DemoByName.get(demo)).create(<HTMLElement>document.getElementById('canvas-container'));
        this.demoName = (<Demo>DemoByName.get(demo)).options.name;

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