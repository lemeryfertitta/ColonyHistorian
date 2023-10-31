const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;
let stream;

const rightSide = document.getElementById('in_game_ab_right');
const recordButton = document.createElement("button");
recordButton.textContent = "Start Recording";
rightSide.insertBefore(recordButton, rightSide.firstChild);
const downloadButton = document.createElement("button");
downloadButton.textContent = "Download";
downloadButton.disabled = true;
rightSide.insertBefore(downloadButton, rightSide.firstChild);

recordButton.onclick = toggleRecording;
downloadButton.onclick = download;

function handleSourceOpen(event) {
    console.log('MediaSource opened');
    sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
    }
}

function handleStop(event) {
    console.log('Recorder stopped: ', event);
    const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
}

function toggleRecording() {
    if (recordButton.textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = 'Start Recording';
        downloadButton.disabled = false;
    }
}

function startRecording() {
    let options = { mimeType: 'video/webm' };
    recordedBlobs = [];
    const canvas = document.querySelector('canvas');
    stream = canvas.captureStream(); // frames per second
    console.log('Started stream capture from canvas element: ', stream);
    mediaRecorder = new MediaRecorder(stream, options);
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    recordButton.textContent = 'Stop Recording';
    downloadButton.disabled = true;
    mediaRecorder.onstop = handleStop;
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(100); // collect 100ms of data
    console.log('MediaRecorder started', mediaRecorder);
}

function stopRecording() {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
}

function download() {
    const blob = new Blob(recordedBlobs, { type: 'video/webm' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}