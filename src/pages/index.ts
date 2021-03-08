import "./index.scss";
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
import Stats from "stats.js";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
// variables
const screenDom = document.body.querySelector(".screen") as HTMLDivElement;
const camera: PerspectiveCamera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
const scene: Scene = new Scene();
const stats = new Stats();
let renderer: Renderer;
let mixer: AnimationMixer;
const clock = new Clock();

function init() {
    // camera.position.set(100, 200, 300);
    camera.position.set(0, 80, 300);
    // scene.background = new Color(0xa0a0a0);
    // scene.fog = new Fog(0xa0a0a0, 100, 300);
    //
    // const hemisphereLight: HemisphereLight = new HemisphereLight(0xffffff, 0x009999);
    // hemisphereLight.position.set(0, 1000, 0);
    // scene.add(hemisphereLight);
    //
    const dirLight = new DirectionalLight( 0xff9900 );
    dirLight.position.set( 1000, 0, 6000 );
    // dirLight.castShadow = true;
    // dirLight.shadow.camera.top = 180;
    // dirLight.shadow.camera.bottom = - 100;
    // dirLight.shadow.camera.left = - 120;
    // dirLight.shadow.camera.right = 120;
    scene.add(dirLight);
    // ------->ground<----------->
    const mesh = new Mesh( new PlaneGeometry( 2000, 2000 ), new MeshPhongMaterial( { color: 0x00ff00, depthWrite: false } ) );
    mesh.rotation.x = - Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );
    // <------->ground<-----------
    // ------->grid<----------->
    // const grid = new GridHelper( 2000, 20, 0x000000, 0x000000 );
    // grid.material.opacity = 0.2;
    // grid.material.transparent = true;
    // scene.add( grid );
    // <------->grid<-----------
    // ------->loader<----------->
    const loader = new FBXLoader();
    loader.load( './src/models/Samba Dancing.fbx', function ( object ) {

        mixer = new AnimationMixer( object );
        console.log("object", object);
        const action = mixer.clipAction( object.animations[ 0 ] );
        action.play();

        object.traverse( function ( child ) {
            if ((child as Mesh).isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add( object );
    });

    // <------->loader<-----------
    // ------->renderer<----------->
    renderer = new WebGLRenderer( { antialias: true } );
    (renderer as WebGLRenderer).setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    (renderer as WebGLRenderer).shadowMap.enabled = true;
    // <------->renderer<-----------

    screenDom.append(renderer.domElement);
    window.addEventListener( 'resize', onWindowResize );

    // stats
    screenDom.appendChild( stats.dom );

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
let isUpdatedTexture = false;
function updateTexture(child: SkinnedMesh) {
    const skinnedMesh = child;
    isUpdatedTexture = true;
    const material = skinnedMesh.material as MeshPhongMaterial;
    const texture = new TextureLoader();
    // material.map
    texture.load("./src/imgs/img-texture-wu4_shan1_wu3_xing2.jpeg", (texture) => {
        console.log("---load---wechat--img5--", child.name, material);
        material.normalMap = texture;
        material.color = child.name === "Alpha_Surface" ? new Color(0xffff00) : new Color(0x00ff00);
        console.log(texture.uuid, material.map?.uuid, child.name);
        renderer.render( scene, camera );
    });
}

function animate() {
    requestAnimationFrame( animate );
    const delta = clock.getDelta();
    if ( mixer ) {
        mixer.update( delta );
    }
    if (!isUpdatedTexture) {
        console.log(scene)
        scene.children.forEach((child) => {
            if (child.type === "Group") {
                child.children.forEach((childOfChildren) => {
                   if (childOfChildren.name === "Alpha_Surface" || childOfChildren.name === "Alpha_Joints") {
                       updateTexture(childOfChildren as SkinnedMesh);
                   }
                });
            }
        });
    }
    renderer.render( scene, camera );
    stats.update();
}

//
init();
animate();
