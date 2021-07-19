import {doLoop} from "../app-func/app-list";

export namespace NSAppEvt {
    export type THandleType = "on" | "once" | "off";
    export type THandleMethod<MAP_PARAM> = (...args:MAP_PARAM[]) => void;
    export interface IHandleInfo<MAP_PARAM> {
        type: THandleType;
        handle: THandleMethod<MAP_PARAM>;
        handleId?: string | number;
    }
    export interface NameParamsMap {
        [name: string]: any[],
    }
    export interface ITriggerLogItem<MAP_PARAM> {
        time: number,
        data: MAP_PARAM[],
    }
}
export class AppEvt<T extends NSAppEvt.NameParamsMap> {
    public readonly id: string = Date.now().toString(32);
    private evtMap: Map<keyof T, Array<NSAppEvt.IHandleInfo<T[keyof T]>>> = new Map<keyof T, Array<NSAppEvt.IHandleInfo<T[keyof T]>>>();
    private triggerLogMap = new Map<keyof T, NSAppEvt.ITriggerLogItem<T[keyof T]>>();

    private getHandleListOf<K extends keyof T>(name: K) {
        return this.evtMap.get(name);
    }

    protected autoTriggerIfEmitted(name: keyof T, handle: NSAppEvt.IHandleInfo<T[keyof T]>, triggerIfEmitted: boolean | number): this {
        if (!triggerIfEmitted) {
            return this;
        }
        if (this.triggerLogMap.has(name)) {
            const {time, data} = this.triggerLogMap.get(name) as NSAppEvt.ITriggerLogItem<T[keyof T]>;
            if (triggerIfEmitted === true) {
                handle.handle.call(null, ...data);
                if (handle.type === "once") {
                    handle.type = "off";
                }
            } else if (typeof triggerIfEmitted === "number") {
                const diff = Date.now() - time;
                if (triggerIfEmitted >= diff) {
                    handle.handle.call(null, ...data);
                    if (handle.type === "once") {
                        handle.type = "off";
                    }
                }
            }
        }
        return this;
    }

    public getHandleByMethod<K extends keyof T>(name: K, method: NSAppEvt.THandleMethod<T[K]>): NSAppEvt.IHandleInfo<T[K]> | null {
        const handleList = this.getHandleListOf(name);
        let handle: NSAppEvt.IHandleInfo<T[K]> | null = null;
        if (handleList) {
            return (handleList.find((handleItem) => {
                return handleItem.handle === method;
            }) || null);
        }
        return handle;
    }

    public getHandleById<K extends keyof T>(name: K, id: string | number): NSAppEvt.IHandleInfo<T[K]>| null {
        const handleList = this.getHandleListOf(name);
        let handle: NSAppEvt.IHandleInfo<T> | null = null;
        if (handleList) {
            return (handleList.find((handleItem) => {
                return handleItem.handleId === id;
            }) || null);
        }
        return handle;
    }

    public bindHandleById(name: keyof T, handle: NSAppEvt.THandleMethod<T[keyof T]>, handleId: string | number, type: NSAppEvt.THandleType = "on", triggerIfEmitted: boolean | number = false): this {
        const handleList = this.getHandleListOf(name);
        if (handleList) {
            let sameHandleMethodItem: NSAppEvt.IHandleInfo<T[keyof T]> | null = null;
            let sameHandleIdItem: NSAppEvt.IHandleInfo<T[keyof T]> | null = null;
            handleList.forEach((handleItem) => {
                if (handleItem.handle === handle) {
                    sameHandleMethodItem = handleItem;
                }
                if (handleItem.handleId === handleId) {
                    sameHandleIdItem = handleItem;
                }
            });
            if (sameHandleIdItem && sameHandleMethodItem) {
                if (sameHandleIdItem === sameHandleMethodItem) {
                    (sameHandleMethodItem as NSAppEvt.IHandleInfo<T>).type = type;
                    return this;
                }
                throw new Error("sameHandleIdItem 与 sameHandleMethodItem 不为同一值，请更换");
            }
            if (sameHandleMethodItem) {
                let handle = sameHandleMethodItem as NSAppEvt.IHandleInfo<T[keyof T]>;
                handle.type = type;
                handle.handleId = handleId;
                return this;
            }
            if (sameHandleIdItem) {
                let handleItem = sameHandleIdItem as NSAppEvt.IHandleInfo<T[keyof T]>;
                handleItem.type = type;
                handleItem.handle = handle;
                return this;
            }
        }
        const newHandleItem = {
            type,
            handle,
            handleId,
        } as NSAppEvt.IHandleInfo<T[keyof T]>;
        if (handleList) {
            handleList.push(newHandleItem);
        } else {
            this.evtMap.set(name, [
                newHandleItem,
            ]);
        }
        return this.autoTriggerIfEmitted(name, newHandleItem, triggerIfEmitted);
    }

    public bindHandleByMethod(name: keyof T, handle: NSAppEvt.THandleMethod<T[keyof T]>, type: NSAppEvt.THandleType = "on", handleId?: string | number, triggerIfEmitted: boolean | number = false): this {
        if (handleId) {
            return this.bindHandleById(name, handle, handleId, type, triggerIfEmitted);
        }
        const handleList = this.getHandleListOf(name);
        if (handleList) {
            const sameMethodHandleItem = handleList.find((handleItem) => handleItem.handle == handle);
            if (sameMethodHandleItem) {
                sameMethodHandleItem.type = type;
                return this;
            }
            const newHandleItem = {
                type,
                handle,
            };
            handleList.push(newHandleItem);
            return this.autoTriggerIfEmitted(name, newHandleItem, triggerIfEmitted);
        }
        const newHandleItem = {
            type,
            handle,
        };
        this.evtMap.set(name, [
            newHandleItem,
        ]);
        return this.autoTriggerIfEmitted(name, newHandleItem, triggerIfEmitted);
    }

    public bindHandle(name: keyof T, handle: NSAppEvt.THandleMethod<T[keyof T]>, type: NSAppEvt.THandleType = "on", handleId?: string | number, triggerIfEmitted: boolean | number = false): this {
        if (handleId) {
            return this.bindHandleById(name, handle, handleId, type, triggerIfEmitted);
        }
        return this.bindHandleByMethod(name, handle, type, handleId, triggerIfEmitted);
    }

    public on(name: keyof T, handle: NSAppEvt.THandleMethod<T[keyof T]>, handleId?: string | number): this {
        return this.bindHandle(name, handle, "on", handleId);
    }

    public once(name: keyof T, handle: NSAppEvt.THandleMethod<T[keyof T]>, handleId?: string | number): this {
        return this.bindHandle(name, handle, "once", handleId);
    }

    public off(name: keyof T, handle: NSAppEvt.THandleMethod<T[keyof T]> | string | number): this {
        if (typeof handle === "function") {
            return this.offByHandleMethod(name, handle);
        }
        return this.offByHandleId(name, handle);
    }

    public offByHandleMethod(name: keyof T, handle: NSAppEvt.THandleMethod<T[keyof T]>): this {
        let handleItem = this.getHandleByMethod(name, handle);
        if (handleItem) {
            handleItem.type = "off";
        }
        return this;
    }

    public offByHandleId(name: keyof T, handleId: string | number): this {
        let handleItem = this.getHandleById(name, handleId);
        if (handleItem) {
            handleItem.type = "off";
        }
        return this;
    }

    public removeOff(name: string): this {
        const handleList = this.getHandleListOf(name);
        if (handleList) {
            this.evtMap.set(name, handleList.filter((item) => {
                return item.type !== "off";
            }));
        }
        return this;
    }

    public removeAll(name?: string): this {
        if (name) {
            this.evtMap.set(name, []);
        }
        this.evtMap.clear();
        return this;
    }

    public emit(name: keyof T, ...args: Array<T[keyof T]>) {

    }
}
