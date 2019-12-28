import { DependencyMap } from "../Map"
import { Dependency } from "../Dependency"
import { DefaultHandler } from "../../FileHandler/DefaultHandler"
import { resolve } from "../Resolve";

test("DependencyGraph", () => {
    const DEP = [
        new Dependency(new DefaultHandler("", "")),
        new Dependency(new DefaultHandler("", "")),
        new Dependency(new DefaultHandler("", "")),
        new Dependency(new DefaultHandler("", ""))
    ];
    DEP[0].add(DEP[2]);
    DEP[3].add(DEP[2]);

    DependencyMap.set("test", DEP[0]);
    DependencyMap.set("test2", DEP[1]);
    DependencyMap.set("test3", DEP[2]);
    DependencyMap.set("test4", DEP[3]);

    const RES = Array.from(resolve(DependencyMap));
    expect(RES[0]).toBe(DEP[2]);
    expect(RES[1]).toBe(DEP[0]);
    expect(RES[2]).toBe(DEP[1]);
    expect(RES[3]).toBe(DEP[3]);
});

test("Circular DependencyGraph", () => {
    const DEP = [
        new Dependency(new DefaultHandler("", "")),
        new Dependency(new DefaultHandler("", "")),
        new Dependency(new DefaultHandler("", "")),
        new Dependency(new DefaultHandler("", ""))
    ];
    DEP[0].add(DEP[2]);
    DEP[3].add(DEP[2]);
    DEP[2].add(DEP[1]);
    DEP[1].add(DEP[0]);

    DependencyMap.set("test", DEP[0]);
    DependencyMap.set("test2", DEP[1]);
    DependencyMap.set("test3", DEP[2]);
    DependencyMap.set("test4", DEP[3]);

    expect(() => resolve(DependencyMap)).toThrowError("Circular dependency detected!");
})