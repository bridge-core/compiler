var MoLang=function(e){"use strict";let t;async function a(e,n,r){let i=await t.readdir(e,{withFileTypes:!0});return await Promise.all(i.map((async i=>{i.isFile()?await r(t.join(e,i.name),t.join(n,i.name)):await a(t.join(e,i.name),t.join(n,i.name),r)}))),[]}function n(e,t,a,r){a.add(e);for(let i of e.dependencies){if("string"==typeof i){const e=r.get(i);if(!e)throw new Error(`Undefined lookup in key registry: "${i}"`);i=e}if(!t.has(i)){if(a.has(i))throw new Error("Circular dependency detected!");n(i,t,a,r)}}t.add(e),a.delete(e)}function r(e,t){let a=new Set;return e.forEach((e=>{a.has(e)||n(e,a,new Set,t)})),a}function i(e,t){var a;return null!==(a=t.find((t=>!t.match||function(e,t){return"string"==typeof e?e.startsWith("RP/")||e.startsWith("BP/")?t.matchPath.startsWith(e):t.relPath.startsWith(e):e(t)}(t.match,e))))&&void 0!==a?a:{}}async function o(e,a,n,r,o,s=!1,l,c){const d=function(e,a,n=!1){let r,i,o=new Set;return{get isRpFile(){return n},get absPath(){return e},get relPath(){return a},get matchPath(){return t.join(n?"RP":"BP",a.replace(/\\/g,"/"))},get dependencies(){return o},get fileContent(){return r},set fileContent(e){r=e},get savePath(){return i},set savePath(e){i=e},add(e){o.add(e)},remove(e){o.delete(e)}}}(e,a,s);d.fileContent=await t.readFile(d.absPath),d.savePath=t.join(d.isRpFile?c:l,d.relPath),n.set(e,d);const u=function(e,t){var a;return null!==(a=i(e,t).plugins)&&void 0!==a?a:[]}(d,o);await Promise.all(u.map((async e=>{var t;const a=await(null===(t=e.afterRead)||void 0===t?void 0:t.call(e,d));a&&(d.fileContent=a)}))),await Promise.all(u.map((e=>{var t;return null===(t=e.resolveDependencies)||void 0===t?void 0:t.call(e,d,r)})))}async function s({bp:e,obp:n,rp:s,orp:l,resolve:c},d){var u,f,v;!function(e){t=e}(d),await Promise.all([t.rmdir(n,{recursive:!0}),t.rmdir(l,{recursive:!0})]),await Promise.all([t.mkdir(n,{recursive:!0}),t.mkdir(l,{recursive:!0})]).catch((()=>{}));const h=new Map,w=new Map;await a(e,".",((e,t)=>o(e,t,h,w,c,!1,n,l))),await a(s,".",((e,t)=>o(e,t,h,w,c,!0,n,l)));const m=[...r(h,w)];for(const e of m){const a=i(e,c),n=null!==(u=a.plugins)&&void 0!==u?u:[];if(0!==n.length||a.doNotTransfer){for(const t of n){const a=await(null===(f=t.transform)||void 0===f?void 0:f.call(t,e));a&&(e.fileContent=a)}for(const t of n.reverse()){const a=await(null===(v=t.afterTransform)||void 0===v?void 0:v.call(t,e));a&&(e.fileContent=a)}if(!a.doNotTransfer){try{await t.mkdir(t.dirname(e.savePath),{recursive:!0})}catch{}await t.writeFile(e.savePath,e.fileContent)}}else{try{await t.mkdir(t.dirname(e.savePath),{recursive:!0})}catch{}await t.copyFile(e.absPath,e.savePath)}}}return e.buildAddOn=s,Object.defineProperty(e,"__esModule",{value:!0}),e}({});