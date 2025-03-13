const updateTextArea = (fragmentShader) => {
    const textArea = document.getElementById("text-editor");
    const lines = fragmentShader.split('\n');
    const newRows = lines.length;
    let newCols = 0;
    lines.forEach(line => {
        newCols = Math.max(newCols, line.length);
    });
    textArea.rows = newRows;
    textArea.cols = newCols;
    textArea.value = fragmentShader;
}

const startGL = (webGLManager) => {
    webGLManager.setShaders(DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER);
    updateTextArea(DEFAULT_FRAGMENT_SHADER);
}


const textAreaKeyupHandler = (event) => {
    const newFragmentShader = event.target.value;
    webGLManager.isProgramReady = false;
    webGLManager.setShaders(DEFAULT_VERTEX_SHADER, newFragmentShader);
    updateTextArea(newFragmentShader);
}

document.addEventListener("DOMContentLoaded", () => {
    // SET UP THE EDITABLE TEXT AREA ON THE RIGHT SIDE.
    const textArea = document.getElementById("text-editor");
    const canvas = document.getElementById("canvas1");

    const webGLManager = new WebGLManager(canvas);

    textArea.onkeyup = textAreaKeyupHandler;

    function animationLoop() {
        requestAnimationFrame(animationLoop);
        webGLManager.animate();
    }

    startGL(webGLManager);
    requestAnimationFrame(animationLoop);
})



