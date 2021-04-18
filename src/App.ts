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
    currentDemo: {
        engine: Engine,
        render: Render,
        runner: Runner,
    };
    vueContext = {
        props: {
            demos: Demos,
            onSelectDemo: (demo: string) => {
                this.setDemo(demo);
            },
            codeUrl: Demos[0].getUrl(),
        },
    };
    vue: Vue;

    constructor () {

        this.vue = new Vue({
            el: '#vue',
            render: h => h(vueApp, this.vueContext),
        });

        this.currentDemo = Demos[0].create(<HTMLElement>document.getElementById('canvas-container'));
    }

    setDemo (demo: string) {
        this.currentDemo.render.mouse.removeListeners();
        this.currentDemo.render.canvas.remove();

        for (const g in this.currentDemo.render) {
            // @ts-ignore
            delete this.currentDemo.render[g];
        }
        this.currentDemo.runner.stop();
        this.currentDemo.runner.stopRender();

        for (const g in this.currentDemo.runner) {
            // @ts-ignore
            delete this.currentDemo.runner[g];
        }
        for (const g in this.currentDemo.engine) {
            // @ts-ignore
            delete this.currentDemo.engine[g];
        }
        this.currentDemo = (<Demo>DemoByName.get(demo)).create(<HTMLElement>document.getElementById('canvas-container'));
        this.vueContext.props.codeUrl = (<Demo>DemoByName.get(demo)).getUrl();
    }

}