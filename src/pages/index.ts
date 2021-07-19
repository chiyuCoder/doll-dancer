import "./index.scss";
import {ying2} from "../class/Yuan1Shen2Ying2";

ying2.init();
ying2.load().then(() => {
    console.log(ying2.scene);
});

window.addEventListener('resize', () => {
    ying2.onResize();
});
(window as any)['ying2'] = ying2;
document.body.addEventListener('mousewheel', (evt) => {
    const wheelEvt = evt as WheelEvent;
    if (wheelEvt.altKey) {
        ying2.moveLightNear(wheelEvt.deltaY);
    } else {
        ying2.moveCameraNear(wheelEvt.deltaY);
    }
});

document.body.addEventListener('mousedown', (evt) => {
    console.log('evt', evt);
});

