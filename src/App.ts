import Vue from 'vue';
import vueApp from './vue/App.vue';
import { Demo, DemoConstructor } from './demo/Demo';
import Bridge from './demos/Bridge';
import { Plugin } from './plugins/Plugin';
import Select from './plugins/Select';
import Copy from './plugins/Copy';


export class App {
    demo: Demo = new Bridge(document.body);
    demoName: string = '';
    vue: Vue;
    paused: boolean = false;
    changeDemo: {(demo: Demo, constr: DemoConstructor): void} = () => {};
    addDemoToVue: {(demo: DemoConstructor): void} = () => {};
    demos: Set<DemoConstructor> = new Set();
    demoByName: Map<string, DemoConstructor> = new Map();
    select: Select = new Select(this);
    copy: Copy = new Copy(this);
    plugins: Plugin[] = [this.select, this.copy];

    constructor (demos: DemoConstructor[], defaultDemo: string) {
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
                codeUrl: '',
            },
        };

        this.vue = new Vue({
            el: '#vue',
            render: h => h(vueApp, context),
        });
        
        this.addDemo(...demos);

        this.setDemo(defaultDemo);
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

            // @ts-ignore
            window.demo = this.demo;
            // @ts-ignore
            window.render = this.demo.render;
            // @ts-ignore
            window.runner = this.demo.runner;
            // @ts-ignore
            window.engine = this.demo.engine;
            // @ts-ignore
            window.mouseJoint = this.demo.mouseJoint;

            console.clear();
            console.log('render: ', this.demo.render);
            console.log('runner: ', this.demo.runner);
            console.log('engine: ', this.demo.engine);
            console.log('mouseJoint: ', this.demo.mouseJoint);

            this.demo.mouseJoint.on('catch-body', (event) => {
                console.log('shape: ', event.shape);
                // @ts-ignore
                window.catchedBody = event.body;
                // @ts-ignore
                window.catchedShape = event.shape;
            });

            for (const plugin of this.plugins) {
                plugin.onChangeDemo(this.demo);
            }
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