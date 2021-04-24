import { App } from './App';
import { DemoConstructor } from './demo/Demo';
import { DemoByName, Demos } from './demos/Demos';


const app = new App(Demos, <DemoConstructor>DemoByName.get('Bridge'));