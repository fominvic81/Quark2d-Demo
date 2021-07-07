import { Plugin } from './Plugin';
import { jsonToBody, bodyToJson } from '../bodyToJson';
import { App } from '../App';
import { BodyType } from 'quark2d';

export default class Copy extends Plugin {
    bodies: string[] = [];

    constructor (app: App) {
        super(app);
        window.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'c':
                    if (event.ctrlKey) {
                        this.bodies.length = 0;
                        const bodies = this.app.select.selectedBodies;

                        for (const body of bodies) {
                            this.bodies.push(bodyToJson(body));
                        }
                    }
                    break;
                case 'v':
                    if (event.ctrlKey) {
                        for (const json of this.bodies) {
                            const body = jsonToBody(json);

                            body.setPosition(this.demo.render.mouse.position);
                            if (body.type === BodyType.static) for (const shape of body.shapes) shape.updateAABB();

                            this.demo.engine.world.add(body);
                        }
                    }
                    break;
            }

        });
    }
}