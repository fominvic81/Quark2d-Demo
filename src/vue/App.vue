<template>
    <div id="app" class="noselect">
        <div class="head">
            <div class="head-left">
            </div>
            <div class="head-center">
                <select class="demo-select" @change="selectDemo">
                    <option v-for="demo in demos"> {{ demo.options.name }} </option>
                </select>
                <a class="code" :href="codeUrl" target="_blank"> { } </a>
            </div>
            <div class="head-right">
                
            </div>
        </div>
        <div id="canvas-container">
            
        </div>
        <div class="options">
            <div class="folder-name">Engine</div>
            <div class="option">
                <input class="checkbox" type="checkbox" id="sleeping">
                <label class="option-name" for="sleeping">Sleeping</label>
            </div>
            <div class="folder-name">Render</div>
            <div class="option">
                <input class="checkbox" type="checkbox" id="showCollisions">
                <label class="option-name" for="showCollisions">showCollisions</label>
            </div>
            <div class="option">
                <input class="checkbox" type="checkbox" id="showSleeping">
                <label class="option-name" for="showSleeping">showSleeping</label>
            </div>
        </div>
    </div>
</template>

<script>
import { Demos, DemoByName } from '../demos/Demos';

export default {
    props: {
        onSelectDemo: {
            type: Function,
            requires: true
        },
    },
    data () {
        return {
            codeUrl: 'https://github.com/fominvic81/Quark2d-Demo',
            demos: Demos,
        }
    },
    methods: {
        selectDemo (event) {
            this.onSelectDemo(event.target.value);
            this.codeUrl = DemoByName.get(event.target.value).getUrl();
        }
    },
    created () {
        this.codeUrl = Demos[0].getUrl();
    }
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

}

.head-center {
    width: 34%;
    justify-content: center;
}

.head-right {
    justify-content: flex-end;
}

.code {
    font-size: 20px;
    text-decoration: none;
    color: rgb(160, 160, 160);
    margin: 0px 20px 0px 20px;
    padding: 2px 3px 2px 3px;
    transition: all .3s;
}

.code:hover {
    background-color: rgba(0, 60, 60, 1);
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
    background-color: rgb(32, 32, 32);
    color: rgb(160, 160, 160);
}

.demo-select option:hover {
    color: rgb(0, 0, 255)
}

.options {
    position: fixed;
    width: 20%;
    height: 100%;
    background-color: rgba(48, 48, 48);
    top: 40px;
    right: -18%;
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

.folder {

}

.folder-name {
    padding: 2px;
    border-bottom: solid 2px rgb(25, 25, 25);
    width: 100%;
    background-color: rgb(40, 40, 40);
    color: rgb(160, 160, 160);
}

.option {
    width: 100%;
    padding: 3px 3px 3px 5px;
    color: rgb(160, 160, 160);
    border-bottom: solid 2px rgb(40, 40, 40);
}

.option:hover {
    background-color: rgb(40, 40, 40);
}

.option-name {
    padding-right: 100%;
}

.checkbox {
    position: absolute;
    right: 0;
    outline: none;
    border: none;
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

</style>