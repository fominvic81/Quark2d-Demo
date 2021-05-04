import {
    Engine,
    Runner,
} from 'quark2d';
import { Render } from 'quark2d-pixi';
import Vue from 'vue';
import vueApp from './vue/App.vue';
import { Demo, DemoConstructor } from './demo/Demo';


export class App {
    demo: {
        engine: Engine,
        render: Render,
        runner: Runner,
    };
    demoName: string;
    vue: Vue;
    paused: boolean = false;
    changeDemo: {(demo: Demo, constr: DemoConstructor): void} = () => {};
    addDemoToVue: {(demo: DemoConstructor): void} = () => {};
    demos: Set<DemoConstructor> = new Set();
    demoByName: Map<string, DemoConstructor> = new Map();

    constructor (demos: DemoConstructor[], defaultDemo: DemoConstructor) {
        const context = {
            props: {
                callback: (changeDemo: {(demo: Demo, constr: DemoConstructor): void}, addDemo: {(demo: DemoConstructor): void}) => {
                    this.changeDemo = changeDemo;
                    this.addDemoToVue = addDemo;
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
                    this.demo.runner.singleStep();
                },
                onSetRenderOption: (option: string, value: boolean) => {
                    // @ts-ignore
                    if (this.demo.render['set' + option[0].toUpperCase() + option.substring(1, option.length)]) {
                        // @ts-ignore
                        this.demo.render['set' + option[0].toUpperCase() + option.substring(1, option.length)](value);
                    } else {
                        // @ts-ignore
                        this.demo.render.options[option] = value;
                    }
                },
                onSetSleeping: (type: number) => {
                    this.demo.engine.sleeping.setType(type);
                },
                // @ts-ignore
                codeUrl: defaultDemo.getUrl(),
            },
        };

        this.vue = new Vue({
            el: '#vue',
            render: h => h(vueApp, context),
        });
        
        this.addDemo(...demos);

        // @ts-ignore
        this.demoName = defaultDemo.options.name;
        this.demo = new defaultDemo(<HTMLElement>document.getElementById('canvas-container'));
        this.changeDemo(this.demo, defaultDemo);
        this.updatePaused();
    }

    setDemo (demoName: string) {
        const demo = this.demoByName.get(demoName);
        if (demo) {
            if (this.demo) {
                this.demo.render.renderer.destroy();
                this.demo.render.stage.destroy();
                this.demo.render.mouse.removeListeners();
                this.demo.render.canvas.remove();
                this.demo.runner.stop();
                this.demo.runner.stopRender();

                for (const g in this.demo.render) {
                    // @ts-ignore
                    delete this.demo.render[g];
                }
                for (const g in this.demo.runner) {
                    // @ts-ignore
                    delete this.demo.runner[g];
                }
                for (const g in this.demo.engine) {
                    // @ts-ignore
                    delete this.demo.engine[g];
                }
            }
            // @ts-ignore
            this.demoName = demo.options.name;
            this.demo = new demo(<HTMLElement>document.getElementById('canvas-container'));
            this.changeDemo(this.demo, demo);
            this.updatePaused();
        }
    }

    addDemo (...demos: DemoConstructor[]) {
        for (const demo of demos) {
            this.demos.add(demo);
            // @ts-ignore
            this.demoByName.set(demo.options.name, demo);
            this.addDemoToVue(demo);
        }
    }

    updatePaused () {
        if (this.paused) {
            this.demo.runner.stop();
        } else {
            this.demo.runner.run();
        }
    }
}