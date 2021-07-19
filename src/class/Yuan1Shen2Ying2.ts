import {
    Camera,
    Scene,
    Renderer,
    PerspectiveCamera,
    Fog,
    HemisphereLight,
    DirectionalLight,
    Mesh,
    PlaneGeometry,
    MeshPhongMaterial,
    GridHelper, AnimationMixer, WebGLRenderer, Color, Clock, SkinnedMesh, TextureLoader
} from "three";
import {MMDLoader} from "three/examples/jsm/loaders/MMDLoader";

class Yuan1Shen2Ying2 {
    public readonly src = './src/models/ying2_yuan1shen2/ying2/ying2.pmx';
    public readonly dom: HTMLDivElement = document.body.querySelector(".screen") as HTMLDivElement;
    public readonly camera: PerspectiveCamera;
    public readonly scene: Scene = new Scene();
    public renderer: WebGLRenderer = new WebGLRenderer({
        antialias: true,
    });
    private light: DirectionalLight = new DirectionalLight(0xffffff);
    constructor() {
        this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }

    protected initAnimate() {
        this.renderer.render(this.scene, this.camera);
        //
        window.requestAnimationFrame(() => {
            this.initAnimate();
        });
    }

    protected installLight() {
        this.light.position.set(0, 0, 10);
        this.scene.add(this.light);
    }

    init(): this {
        this.camera.position.set(0, 10, 60);
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.shadowMap.enabled = true;
        this.installLight();
        this.dom.appendChild(this.renderer.domElement);
        this.initAnimate();
        return this;
    }

    load(): Promise<void> {
        return new Promise((resolve) => {
            const loader = new MMDLoader();
            loader.load(this.src, (obj) => {
                this.scene.add(obj);
                resolve();
            });
        });
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
    }

    moveCameraNear(diff: number): this {
        this.camera.position.z += diff;
        return this;
    }

    moveLightNear(diff: number): this {
        this.light.position.z += diff;
        return this;
    }

    printLightPosition(): this {
        console.log(`light at (${this.light.position.x}, ${this.light.position.y}, ${this.light.position.z})`);
        return this;
    }

    printCameraPosition(): this {
        console.log(`light at (${this.camera.position.x}, ${this.camera.position.y}, ${this.camera.position.z})`);
        return this;
    }

    printPositionOfLightAndCamera(): this {
        return this.printLightPosition().printCameraPosition();
    }
}

export const ying2 = new Yuan1Shen2Ying2();
