import "./index.scss";
import {BasePage} from "../class/BasePage";
import {BoxGeometry, Color, Mesh, MeshBasicMaterial, TextureLoader} from "three";

const basePage = new BasePage();
basePage.camera.position.set(0, 0, 1000);
basePage.render();
const textureLoader = new TextureLoader();
textureLoader.load("./src/imgs/img-texture-wu4_shan1_wu3_xing2.jpeg", (texture) => {
    const box = new BoxGeometry(100, 100, 100);
    const boxMaterial = new MeshBasicMaterial({
        map: texture,
    });
    const boxMesh = new Mesh(box, boxMaterial);
    boxMesh.position.set(0, 0, 0);
    boxMesh.rotateX(45).rotateY(45);
    basePage.addObj(boxMesh, "box").render();

});

let i = 0;
function animate() {
    const boxMesh = basePage.getObjByName("box") as Mesh;
    if (boxMesh) {
        boxMesh.rotateX( 1 / 100).rotateY(5 / 100);
    }
}

basePage.animate(animate);

setTimeout(() => {
    textureLoader.load("./src/imgs/China2098-6.jpg", (texture2) => {
        // console.log("texture 2");
        const boxMesh = basePage.getObjByName("box") as Mesh;
        const boxMaterial = boxMesh.material as MeshBasicMaterial;
        if (boxMaterial.map) {
            boxMaterial.map.dispose();
            boxMaterial.map = texture2;
            basePage.render();
        }
    });
}, 2000);

