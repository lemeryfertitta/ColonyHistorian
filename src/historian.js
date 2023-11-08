var enc = new TextDecoder("utf-8");
let content = [];

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
        } else { // No arguments (browsers will throw an error)
            ws = new OrigWebSocket();
        }

        wsAddListener(ws, 'message', function (event) {
            console.log(event.data)
            content.push(event.data)
            createDownloadButton()
        });
        return ws;
    }.bind();
    window.WebSocket.prototype = OrigWebSocket.prototype;
    window.WebSocket.prototype.constructor = window.WebSocket;

    var wsSend = OrigWebSocket.prototype.send;
    wsSend = wsSend.apply.bind(wsSend);
    OrigWebSocket.prototype.send = function (data) {
        console.log(data)
        return wsSend(this, arguments);
    };
})();


function saveLog() {
    const blob = new Blob(content, { type: "text/plain" });
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(blob);
    const date = new Date();
    anchor.download = date.toISOString() + ".historian"
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
}

function createDownloadButton() {
    if (document.getElementById("historian-download") == null) {
        const rightSide = document.getElementById("in_game_ab_right");
        if (rightSide != null) {
            const downloadButton = document.createElement("button");
            downloadButton.id = "historian-download";
            downloadButton.onclick = saveLog;
            downloadButton.innerText = "Download Log"
            rightSide.insertBefore(downloadButton, rightSide.firstChild);
        }
    }
}





