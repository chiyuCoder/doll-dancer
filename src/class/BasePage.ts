import {Color, Object3D, PerspectiveCamera, Scene, WebGLRenderer} from "three";

export class BasePage {
    public readonly camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    public readonly scene = new Scene();
    public readonly dom = document.body.querySelector(".screen") as HTMLDivElement;
    public readonly renderer = new WebGLRenderer( { antialias: true } );
    public readonly map: Map<String, Object3D> = new Map<String, Object3D>();
    protected animateId: number = 0;
    constructor() {
        this.scene.add(this.camera);
        this.scene.background = new Color(0x00ff00);
        this.setSize();
        this.setPixelRatio();
        this.dom.append(this.renderer.domElement);
        window.addEventListener("resize", this.onResize.bind(this));
    }
    public setPixelRatio(): void {
        this.renderer.setPixelRatio(window.devicePixelRatio);
    }
    public setSize(): void {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    public addObj(obj: Object3D, name: string = ""): this {
        this.scene.add(obj);
        if (name) {
            this.map.set(name, obj);
        }
        return this;
    }

    public getObjByName(name: string): Object3D | undefined {
        return this.map.get(name);
    }

    public render(): void {
        this.renderer.render(this.scene, this.camera);
    }

    public animate(func: () => void) {
        func();
        this.render();
        this.animateId = window.requestAnimationFrame(() => {
            this.animate(func);
        });
    }

    public stopAnimate() {
        window.cancelAnimationFrame(this.animateId);
    }

    protected onResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.setSize();
    }
}
