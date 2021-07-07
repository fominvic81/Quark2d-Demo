import { Graphics, utils } from 'pixi.js';
import { AABB, Body, Vector } from 'quark2d';
import { Mouse, Render } from 'quark2d-pixi';
import { Demo } from '../demo/Demo';
import { Plugin } from './Plugin';

interface CustomMouseEvent {
    event: MouseEvent;
    mouse: Mouse;
}

export default class Select extends Plugin {
    graphics: Graphics = new Graphics();
    selecting: boolean = false;
    start: Vector = new Vector();
    curPosition: Vector = new Vector();
    selectedBodies: Set<Body> = new Set();

    onChangeDemo (demo: Demo) {
        super.onChangeDemo(demo);
        this.selecting = false;
        this.selectedBodies.clear();
        this.demo = demo;

        demo.render.stage.addChild(this.graphics);

        demo.runner.on('render', () => {
            this.render();
        });

        demo.render.mouse.on('mouse-down', event => this.mouseDown(event));
        demo.render.mouse.on('mouse-up', event => this.mouseUp(event));
        demo.render.mouse.on('mouse-move', event => this.mouseMove(event));

        window.addEventListener('keydown', (event) => {

            switch (event.key) {
                case 'Delete':
                case 'Backspace':
                    for (const body of this.selectedBodies) {
                        demo.engine.world.removeBody(body);
                        for (const joint of body.joints) {
                            demo.engine.world.removeJoint(joint);
                        }
                    }
                    this.selectedBodies.clear();
                    break;
            }

        });
    }

    render () {
        this.graphics.clear();

        if (this.selecting) {
            this.graphics.beginFill(utils.rgb2hex([0, 0.3, 0.5]), 0.5);

            const aabb = AABB.temp[0].setNum(
                Math.min(this.start.x, this.curPosition.x),
                Math.min(this.start.y, this.curPosition.y),
                Math.max(this.start.x, this.curPosition.x),
                Math.max(this.start.y, this.curPosition.y),
            );
            this.graphics.drawRect(aabb.minX, aabb.minY, aabb.getWidth(), aabb.getHeight());

            this.graphics.endFill();
        }

        this.graphics.lineStyle(0.05, utils.rgb2hex([1, 1, 1]));
        for (const body of this.selectedBodies) {
            for (const shape of body.shapes) {
                this.graphics.drawRect(shape.aabb.minX, shape.aabb.minY, shape.aabb.getWidth(), shape.aabb.getHeight());
            }
        }

    }

    mouseDown (event: CustomMouseEvent) {
        if (event.event.shiftKey && event.mouse.leftButtonPressed) {
            this.selecting = true;
            this.selectedBodies.clear();

            this.disableMouseJoint();

            event.mouse.position.clone(this.start);
            event.mouse.position.clone(this.curPosition);
        }
    }

    mouseUp (event: CustomMouseEvent) {
        if (this.selecting && !event.mouse.leftButtonPressed) {
            event.mouse.position.clone(this.curPosition);
            this.selecting = false;

            const aabb = AABB.temp[0].setNum(
                Math.min(this.start.x, this.curPosition.x),
                Math.min(this.start.y, this.curPosition.y),
                Math.max(this.start.x, this.curPosition.x),
                Math.max(this.start.y, this.curPosition.y),
            );

            for (const shape of this.demo.engine.aabbTest(aabb)) {
                this.selectedBodies.add(shape.body!);
            }
        }
    }

    mouseMove (event: CustomMouseEvent) {
        if (this.selecting) {
            event.mouse.position.clone(this.curPosition);
        }
    }

    disableMouseJoint () {
        this.demo.mouseJoint.body = undefined;
        this.demo.mouseJoint.shape = undefined;

        for (const joint of this.demo.mouseJoint.joints) {
            joint.setBodyA();
        }
    }
}