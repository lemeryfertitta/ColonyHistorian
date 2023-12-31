let content = [];
let activeGameId = null;
const GAME_START_TYPE = 1;
const GAME_END_TYPE = 45;

// msgpack.min.js from ygoe/msgpack
// prettier-ignore
!function(){"use strict";function e(r,s){if(s&&s.multiple&&!Array.isArray(r))throw new Error("Invalid argument type: Expected an Array to serialize multiple values.");const d=4294967296;let y,h,n=new Uint8Array(128),i=0;if(s&&s.multiple)for(let e=0;e<r.length;e++)g(r[e]);else g(r);return n.subarray(0,i);function g(r,e){switch(typeof r){case"undefined":w();break;case"boolean":m(r?195:194);break;case"number":var t=r;isFinite(t)&&Math.floor(t)===t?0<=t&&t<=127||t<0&&-32<=t?m(t):0<t&&t<=255?b([204,t]):-128<=t&&t<=127?b([208,t]):0<t&&t<=65535?b([205,t>>>8,t]):-32768<=t&&t<=32767?b([209,t>>>8,t]):0<t&&t<=4294967295?b([206,t>>>24,t>>>16,t>>>8,t]):-2147483648<=t&&t<=2147483647?b([210,t>>>24,t>>>16,t>>>8,t]):0<t&&t<=0x10000000000000000?(n=t/d,i=t%d,b([211,n>>>24,n>>>16,n>>>8,n,i>>>24,i>>>16,i>>>8,i])):-0x8000000000000000<=t&&t<=0x8000000000000000?(m(211),v(t)):b(t<0?[211,128,0,0,0,0,0,0,0]:[207,255,255,255,255,255,255,255,255]):(h||(y=new ArrayBuffer(8),h=new DataView(y)),h.setFloat64(0,t),m(203),b(new Uint8Array(y)));break;case"string":var n=r,i=(n=function(n){let r=!0,i=n.length;for(let e=0;e<i;e++)if(127<n.charCodeAt(e)){r=!1;break}let a=0,o=new Uint8Array(n.length*(r?1:4));for(let t=0;t!==i;t++){let r=n.charCodeAt(t);if(r<128)o[a++]=r;else{if(r<2048)o[a++]=r>>6|192;else{if(55295<r&&r<56320){if(++t>=i)throw new Error("UTF-8 encode: incomplete surrogate pair");let e=n.charCodeAt(t);if(e<56320||57343<e)throw new Error("UTF-8 encode: second surrogate character 0x"+e.toString(16)+" at index "+t+" out of range");r=65536+((1023&r)<<10)+(1023&e),o[a++]=r>>18|240,o[a++]=r>>12&63|128}else o[a++]=r>>12|224;o[a++]=r>>6&63|128}o[a++]=63&r|128}}return r?o:o.subarray(0,a)}(r)).length;i<=31?m(160+i):b(i<=255?[217,i]:i<=65535?[218,i>>>8,i]:[219,i>>>24,i>>>16,i>>>8,i]),b(n);break;case"object":if(null===r)w();else if(r instanceof Date){t=r;var a=t.getTime()/1e3;0===t.getMilliseconds()&&0<=a&&a<4294967296?b([214,255,a>>>24,a>>>16,a>>>8,a]):0<=a&&a<17179869184?b([215,255,(o=1e6*t.getMilliseconds())>>>22,o>>>14,o>>>6,o<<2>>>0|a/d,a>>>24,a>>>16,a>>>8,a]):(b([199,12,255,(o=1e6*t.getMilliseconds())>>>24,o>>>16,o>>>8,o]),v(a))}else if(Array.isArray(r))p(r);else if(r instanceof Uint8Array||r instanceof Uint8ClampedArray){var o=r;a=o.length;b(a<=15?[196,a]:a<=65535?[197,a>>>8,a]:[198,a>>>24,a>>>16,a>>>8,a]);b(o)}else if(r instanceof Int8Array||r instanceof Int16Array||r instanceof Uint16Array||r instanceof Int32Array||r instanceof Uint32Array||r instanceof Float32Array||r instanceof Float64Array)p(r);else{var f,l,u=r;let e=0;for(f in u)void 0!==u[f]&&e++;for(l in e<=15?m(128+e):e<=65535?b([222,e>>>8,e]):b([223,e>>>24,e>>>16,e>>>8,e]),u){var c=u[l];void 0!==c&&(g(l),g(c))}}break;default:if(e||!s||!s.invalidTypeReplacement)throw new Error("Invalid argument type: The type '"+typeof r+"' cannot be serialized.");"function"==typeof s.invalidTypeReplacement?g(s.invalidTypeReplacement(r),!0):g(s.invalidTypeReplacement,!0)}}function w(){m(192)}function p(r){var t=r.length;t<=15?m(144+t):b(t<=65535?[220,t>>>8,t]:[221,t>>>24,t>>>16,t>>>8,t]);for(let e=0;e<t;e++)g(r[e])}function m(e){if(n.length<i+1){let e=2*n.length;for(;e<i+1;)e*=2;let r=new Uint8Array(e);r.set(n),n=r}n[i]=e,i++}function b(t){if(n.length<i+t.length){let e=2*n.length;for(;e<i+t.length;)e*=2;let r=new Uint8Array(e);r.set(n),n=r}n.set(t,i),i+=t.length}function v(e){let r,t;t=0<=e?(r=e/d,e%d):(e++,r=Math.abs(e)/d,t=Math.abs(e)%d,r=~r,~t),b([r>>>24,r>>>16,r>>>8,r,t>>>24,t>>>16,t>>>8,t])}}function r(o,e){const i=4294967296;let f=0;if("object"!=typeof(o=o instanceof ArrayBuffer?new Uint8Array(o):o)||void 0===o.length)throw new Error("Invalid argument type: Expected a byte array (Array or Uint8Array) to deserialize.");if(!o.length)throw new Error("Invalid argument: The byte array to deserialize is empty.");o instanceof Uint8Array||(o=new Uint8Array(o));let r;if(e&&e.multiple)for(r=[];f<o.length;)r.push(a());else r=a();return r;function a(){var e=o[f++];if(0<=e&&e<=127)return e;if(128<=e&&e<=143)return n(e-128);if(144<=e&&e<=159)return s(e-144);if(160<=e&&e<=191)return d(e-160);if(192===e)return null;if(193===e)throw new Error("Invalid byte code 0xc1 found.");if(194===e)return!1;if(195===e)return!0;if(196===e)return c(-1,1);if(197===e)return c(-1,2);if(198===e)return c(-1,4);if(199===e)return y(-1,1);if(200===e)return y(-1,2);if(201===e)return y(-1,4);if(202===e)return t(4);if(203===e)return t(8);if(204===e)return u(1);if(205===e)return u(2);if(206===e)return u(4);if(207===e)return u(8);if(208===e)return l(1);if(209===e)return l(2);if(210===e)return l(4);if(211===e)return l(8);if(212===e)return y(1);if(213===e)return y(2);if(214===e)return y(4);if(215===e)return y(8);if(216===e)return y(16);if(217===e)return d(-1,1);if(218===e)return d(-1,2);if(219===e)return d(-1,4);if(220===e)return s(-1,2);if(221===e)return s(-1,4);if(222===e)return n(-1,2);if(223===e)return n(-1,4);if(224<=e&&e<=255)return e-256;throw console.debug("msgpack array:",o),new Error("Invalid byte value '"+e+"' at index "+(f-1)+" in the MessagePack binary data (length "+o.length+"): Expecting a range of 0 to 255. This is not a byte array.")}function l(e){let r=0,t=!0;for(;0<e--;){var n;t?(n=o[f++],r+=127&n,128&n&&(r-=128),t=!1):r=(r*=256)+o[f++]}return r}function u(e){let r=0;for(;0<e--;)r=(r*=256)+o[f++];return r}function t(e){let r=new DataView(o.buffer,f+o.byteOffset,e);return f+=e,4===e?r.getFloat32(0,!1):8===e?r.getFloat64(0,!1):void 0}function c(e,r){e<0&&(e=u(r));r=o.subarray(f,f+e);return f+=e,r}function n(e,r){e<0&&(e=u(r));let t={};for(;0<e--;){var n=a();t[n]=a()}return t}function s(e,r){e<0&&(e=u(r));let t=[];for(;0<e--;)t.push(a());return t}function d(e,n){e<0&&(e=u(n));n=f;f+=e;{var i=o,a=e;let r=n,t="";for(a+=n;r<a;){let e=i[r++];if(127<e)if(191<e&&e<224){if(r>=a)throw new Error("UTF-8 decode: incomplete 2-byte sequence");e=(31&e)<<6|63&i[r++]}else if(223<e&&e<240){if(r+1>=a)throw new Error("UTF-8 decode: incomplete 3-byte sequence");e=(15&e)<<12|(63&i[r++])<<6|63&i[r++]}else{if(!(239<e&&e<248))throw new Error("UTF-8 decode: unknown multibyte start 0x"+e.toString(16)+" at index "+(r-1));if(r+2>=a)throw new Error("UTF-8 decode: incomplete 4-byte sequence");e=(7&e)<<18|(63&i[r++])<<12|(63&i[r++])<<6|63&i[r++]}if(e<=65535)t+=String.fromCharCode(e);else{if(!(e<=1114111))throw new Error("UTF-8 decode: code point 0x"+e.toString(16)+" exceeds UTF-16 reach");e-=65536,t=(t+=String.fromCharCode(e>>10|55296))+String.fromCharCode(1023&e|56320)}}return t}}function y(e,r){e<0&&(e=u(r));r=u(1),e=c(e);if(255!==r)return{type:r,data:e};r=e;if(4===r.length)return n=(r[0]<<24>>>0)+(r[1]<<16>>>0)+(r[2]<<8>>>0)+r[3],new Date(1e3*n);if(8===r.length)return n=(r[0]<<22>>>0)+(r[1]<<14>>>0)+(r[2]<<6>>>0)+(r[3]>>>2),t=(3&r[3])*i+(r[4]<<24>>>0)+(r[5]<<16>>>0)+(r[6]<<8>>>0)+r[7],new Date(1e3*t+n/1e6);if(12!==r.length)throw new Error("Invalid data length for a date value.");var t=(r[0]<<24>>>0)+(r[1]<<16>>>0)+(r[2]<<8>>>0)+r[3],n=(f-=8,l(8));return new Date(1e3*n+t/1e6)}}var t={serialize:e,deserialize:r,encode:e,decode:r};"object"==typeof module&&module&&"object"==typeof module.exports?module.exports=t:window[window.msgpackJsName||"msgpack"]=t}();

(function () {
  var OrigWebSocket = window.WebSocket;
  var callWebSocket = OrigWebSocket.apply.bind(OrigWebSocket);
  var wsAddListener = OrigWebSocket.prototype.addEventListener;
  wsAddListener = wsAddListener.call.bind(wsAddListener);
  window.WebSocket = function WebSocket(url, protocols) {
    var ws;
    if (!(this instanceof WebSocket)) {
      // Called without 'new' (browsers will throw an error).
      ws = callWebSocket(this, arguments);
    } else if (arguments.length === 1) {
      ws = new OrigWebSocket(url);
    } else if (arguments.length >= 2) {
      ws = new OrigWebSocket(url, protocols);
    } else {
      // No arguments (browsers will throw an error)
      ws = new OrigWebSocket();
    }

    wsAddListener(ws, "message", function (event) {
      try {
        const data = msgpack.decode(event.data);
        if (activeGameId) {
          content.push(data);
          if (data && data.data && data.data.type == GAME_END_TYPE) {
            saveLog();
            // Reset the game log for the next game
            activeGameId = null;
            content = [];
          }
        } else if (
          data &&
          data.data &&
          data.data.type == GAME_START_TYPE &&
          data.data.payload &&
          data.data.payload.databaseGameId
        ) {
          activeGameId = data.data.payload.databaseGameId;
          content.push(data);
        } else {
          console.debug("No active game to record, skipping message", data);
        }
      } catch (error) {
        console.log("Error decoding message:", error);
      }
    });
    return ws;
  }.bind();
  window.WebSocket.prototype = OrigWebSocket.prototype;
  window.WebSocket.prototype.constructor = window.WebSocket;
})();

function saveLog() {
  const blob = new Blob([JSON.stringify(content)], {
    type: "application/json",
  });
  const anchor = document.createElement("a");
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `historian-${activeGameId}.json`;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
}
