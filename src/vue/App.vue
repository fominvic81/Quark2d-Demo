<template>
    <div id="app" class="noselect">
        <div class="head">
            <div class="head-left">
                <div class="button" @click="alertInfo()" style="width: 25px; height: min-content; font-size: 23px; font-family: monospace;"> i </div>
                <div class="button" @click="togglePlay" title="Play/Pause(p)">
                    <svg fill="#a0a0a0" width="100%" height="100%" viewBox="0 0 36 36">
                        <path v-if="paused" d="M11,10 L18,13.74 18,22.28 11,26 M18,13.74 L26,18 26,18 18,22.28"></path>
                        <path v-else d="M11,10 L17,10 17,26 11,26 M20,10 L26,10 26,26 20,26"></path>
                    </svg>
                </div>
                <div class="button" @click="singleStep" title="Single step(o)">
                    <svg fill="#a0a0a0" width="16px" height="16px" viewBox="0 0 512 512" style="margin: 7px;">
                        <path d="M0,256L256,0v128L128,256l128,128v128L0,256z M512,512V384L384,256l128-128V0L256,256L512,512z" transform="rotate(180, 256, 256)"></path>
                    </svg>
                </div>
                <div class="button" @click="onRestart" title="Restart(r)">
                    <svg fill="#a0a0a0" width="24px" height="24px" viewBox="0 0 24 24" style="margin: 3px;">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
                    </svg>
                </div>
            </div>
            <div class="head-center">
                <select class="demo-select" @change="(e) => {onSelectDemo(e.target.value)}">
                    <option v-for="(demo, index) in demos" :key="index"> {{ demo.options.name }} </option>
                </select>
                <a class="text" :href="codeUrl" target="_blank"> { } </a>
            </div>
            <div class="head-right">
                <a class="text" href="https://github.com/fominvic81/Quark2d">Github</a>
            </div>
        </div>
        <a class="info-field">
            <template v-for="i in info">
                <div class="info" :key="i">
                    {{ i }}
                </div>
            </template>
        </a>
        <div id="canvas-container">
        </div>
        <div class="options">
            <div class="folder-name">Runner</div>
            <div class="option">
                <div class="option-name">Runner type</div>
                <select class="select" v-model="runnerOptions.type" @change="onSetSleeping(sleeping)">
                    <option :value="RunnerType.fixed">Fixed</option>
                    <option :value="RunnerType.dynamic">Dynamic</option>
                </select>
            </div>
            <div class="option">
                <div class="option-name">Timescale</div>
                <div class="range-container">
                    <div class="range-value"> {{ runnerOptions.timescale }} </div>
                    <input class="range-range" type="range" v-model="runnerOptions.timescale" min="0.5" max="5" step="0.25">
                </div>
            </div>
            <div class="option">
                <input class="checkbox" type="checkbox" id="runner-correction" v-model="runnerOptions.correction">
                <label class="option-name" for="runner-correction"> Correction(for dynamic) </label>
            </div>
            <div class="folder-name">Engine</div>
            <div class="option">
                <div class="option-name">Sleeping</div>
                <select class="select" v-model="sleeping" @change="onSetSleeping(sleeping)">
                    <option :value="SleepingType.NO_SLEEPING">No sleeping</option>
                    <option :value="SleepingType.BODY_SLEEPING">Body sleeping</option>
                    <option :value="SleepingType.ISLAND_SLEEPING" disabled>Island sleeping</option>
                </select>
            </div>
            <div class="option">
                <a class="option-name">GravityX</a>
                <div class="range-container">
                    <div class="range-value"> {{ gravity.x }} </div>
                    <input class="range-range" type="range" v-model="gravity.x" min="-20" max="20" step="1">
                </div>
            </div>
            <div class="option">
                <a class="option-name">GravityY</a>
                <div class="range-container">
                    <div class="range-value"> {{ gravity.y }} </div>
                    <input class="range-range" type="range" v-model="gravity.y" min="-20" max="20" step="1">
                </div>
            </div>
            <div class="folder-name">Solver</div>
            <div class="option">
                <a class="option-name">Iterations</a>
                <div class="range-container">
                    <div class="range-value"> {{ solverOptions.iterations }} </div>
                    <input class="range-range" type="range" id="Iterations" v-model="solverOptions.iterations" min="1" max="30" step="1">
                </div>
            </div>
            <div class="option">
                <a class="option-name">JointIterations</a>
                <div class="range-container">
                    <div class="range-value"> {{ solverOptions.jointIterations }} </div>
                    <input class="range-range" type="range" id="JointIterations" v-model="solverOptions.jointIterations" min="1" max="30" step="1">
                </div>
            </div>
            <div class="option">
                <input class="checkbox" type="checkbox" id="warmStarting" v-model="solverOptions.warmStarting">
                <label class="option-name" for="warmStarting"> WarmStarting </label>
            </div>
            <div class="folder-name">Render</div>
            <template v-for="(value, option) in renderOptions">
                <div class="option" :key="option">
                    <input class="checkbox" type="checkbox" :id="option" @change="setRenderOption" :checked="value">
                    <label class="option-name" :for="option">{{ option }}</label>
                </div>
            </template>
            <div class="folder-name">Settings</div>
            <div class="option">
                <a class="option-name">restitutionThreshold</a>
                <input class="input-number" type="number" v-model="Settings.restitutionThreshold">
            </div>
            <div class="option">
                <a class="option-name">depthDamping</a>
                <input class="input-number" type="number" v-model="Settings.depthDamping">
            </div>
            <div class="option">
                <a class="option-name">defaultDensity</a>
                <input class="input-number" type="number" v-model="Settings.defaultDensity">
            </div>
            <div class="option">
                <a class="option-name">defaultRestitution</a>
                <input class="input-number" type="number" v-model="Settings.defaultRestitution">
            </div>
            <div class="option">
                <a class="option-name">defaultFriction</a>
                <input class="input-number" type="number" v-model="Settings.defaultFriction">
            </div>
            <div class="option">
                <a class="option-name">motionSleepLimit</a>
                <input class="input-number" type="number" v-model="Settings.motionSleepLimit">
            </div>
            <div class="option">
                <a class="option-name">collisionMotionSleepLimit</a>
                <input class="input-number" type="number" v-model="Settings.collisionMotionSleepLimit">
            </div>
            <div class="option">
                <a class="option-name">sleepyTime</a>
                <input class="input-number" type="number" v-model="Settings.sleepyTime">
            </div>
            <div style="height: 40px"></div>
        </div>
        <input id="focus" type="text" style="position: absolute; opacity: 0;">
    </div>
</template>

<script>
import { SleepingType, Vector, RunnerType, Settings } from 'quark2d';

export default {
    props: {
        callback: {
            type: Function,
            required: true,
        },
        onSelectDemo: {
            type: Function,
            required: true,
        },
        onTogglePlay: {
            type: Function,
            required: true,
        },
        onRestart: {
            type: Function,
            required: true,
        },
        onSingleStep: {
            type: Function,
            required: true,
        },
        onSetRenderOption: {
            type: Function,
            required: true,
        },
        onSetSleeping: {
            type: Function,
            required: true,
        },
    },
    data () {
        return {
            codeUrl: 'https://github.com/fominvic81/Quark2d-Demo',
            demos: [],
            paused: false,
            renderOptions: {
                showCollisions: false,
                showSleeping: false,
                showJoints: false,
                showSensors: false,
                showAABBs: false,
                showPositions: false,
                showStatus: false,
                showBroadphase: false,
            },
            solverOptions: {
                iterations: 0,
                jointIterations: 0,
            },
            runnerOptions: {
                type: 0,
                tps: 60,
                timescale: 1,
                correction: false,
            },
            sleeping: SleepingType.NO_SLEEPING,
            RunnerType,
            SleepingType,
            Settings,
            gravity: new Vector(),
            info: [''],
        }
    },
    methods: {
        togglePlay () {
            this.paused = !this.paused;
            this.onTogglePlay(this.paused);
        },
        singleStep () {
            this.paused = true;
            this.onSingleStep();
        },
        setRenderOption (event) {
            const option = event.target.id;
            const value = event.target.checked;
            this.onSetRenderOption(option, value);
            this.renderOptions[option] = value;
        },
        changeDemo (demo, constr) {
            document.getElementById('focus').focus();
            const renderOptions = demo.render.options;
            for (const option of Object.entries(renderOptions)) {
                this.renderOptions[option[0]] = option[1];
            }
            this.runnerOptions = demo.runner.options;
            this.solverOptions = demo.engine.solver.options;
            this.sleeping = demo.engine.sleeping.type;
            this.codeUrl = constr.getUrl();
            this.gravity = demo.engine.gravity;
            this.info = Array.isArray(constr.options.info) ? constr.options.info : [constr.options.info];
        },
        addDemo (demo) {
            this.demos.push(demo);
        },
        alertInfo () {
            alert(`
                p - Pause
                o - Single step
                r - Restart
                shift + drag - Select bodies.
                ctrl + c - Copy selected bodies.
                ctrl + v - Paste bodies.
                delete or backspace - Delete selected bodies.
            `);
        }
    },
    created () {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'p') {
                this.togglePlay();
            } else if (event.key === 'o') {
                this.singleStep();
            } else if (event.key === 'r') {
                this.onRestart();
            }
        });
        this.callback(this.changeDemo, this.addDemo);
    },
}

</script scoped>

<style>

#app {
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background-color: rgb(48, 48, 48);
}

.head {
    display: flex;
    justify-content: space-between;
    position: fixed;
    width: 100%;
    height: 40px;
    background-color: rgba(0, 0, 0, 0.3);
}

.head-left, .head-center, .head-right {
    display: flex;
    align-items: center;
    width: 33%;
}

.head-left {
    justify-content: flex-start;
}

.head-center {
    width: 34%;
    justify-content: center;
}

.head-right {
    justify-content: flex-end;
}

.button {
    width: 30px;
    height: 30px;
    font-size: 20px;
    text-decoration: none;
    color: rgb(160, 160, 160);
    margin: 5px 2px;
    transition: all .3s;
    transition: all .3s;
    text-align: center;
}

.button:hover {
    background-color: rgb(0, 60, 60);
} 

.text {
    font-size: 20px;
    text-decoration: none;
    color: rgb(160, 160, 160);
    margin: 0px 8px 0px 20px;
    padding: 2px 3px 2px 3px;
    transition: all .3s;
    text-align: center;
}

.text:hover {
    background-color: rgb(0, 60, 60);
}

.demo-select {
    background-color: rgba(0, 0, 0, 0);
    color: rgb(160, 160, 160);
    outline: none;
    border: none;
    padding-left: 50px;
    padding-right: 50px;
}

.demo-select option {
    background-color: rgb(48, 48, 48);
}

.options {
    position: fixed;
    width: 20%;
    height: 100%;
    background-color: rgba(48, 48, 48);
    top: 40px;
    right: -16%;
    opacity: 0.7;
    transition: all ease-out 0.4s;
    border-left: solid 2px rgb(44, 44, 44);
    overflow: scroll;
    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    scrollbar-width: none;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.options::-webkit-scrollbar {
    display: none;
}

.options:hover {
    right: 0px;
    opacity: 1;
}

.folder-name {
    display: flex;
    align-items: center;
    width: 100%;
    height: 25px;
    background-color: rgb(40, 40, 40);
    color: rgb(160, 160, 160);
    border-bottom: solid 2px rgb(25, 25, 25);
}

.option {
    display: flex;
    align-items: center;
    width: 100%;
    height: 30px;
    color: rgb(160, 160, 160);
    border-bottom: solid 2px rgb(40, 40, 40);
}

.option:hover {
    background-color: rgb(40, 40, 40);
}

.option-name {
    display: flex;
    align-items: center;
    height: 100%;
    width: 100%;
    padding-left: 4px;
}

.select {
    position: absolute;
    right: 5px;
    background-color: rgba(0, 0, 0, 0);
    color: rgb(160, 160, 160);
    outline: none;
    border: none;
}

.select option {
    background-color: rgb(48, 48, 48);
}

.checkbox {
    position: absolute;
    right: 4px;
    outline: none;
    border: none;
}

.range-container {
    position: absolute;
    right: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 50%;
    height: 20px;
}

.range-range {
    width: calc(95% - 30px);
    height: 80%;
}

.range-value {
    text-overflow: clip;
    width: 30px;
    height: 80%;
    border: none;
    background-color: rgba(0, 0, 0, 0);
    color: rgb(160, 160, 160);
}

.info-field {
    position: absolute;
    bottom: 3px;
    left: 3px;
}
.info {
    color: rgb(160, 160, 160);
    font-size: x-large;
}

.input-number {
    position: absolute;
    width: 30%;
    right: 4px;
    outline: none;
}

#canvas-container {
    width: 100%;
    height: 100%;
}

.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}

input[type='range'] {
    overflow: hidden;
    -webkit-appearance: none;
    background-color: rgb(80, 80, 100);
}

input[type='range']::-webkit-slider-thumb {
    width: 1px;
    height: 0px;
    -webkit-appearance: none;
    box-shadow: -100vw 0 0 100vw rgb(60, 60, 80);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}

</style>