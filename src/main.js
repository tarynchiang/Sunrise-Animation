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

    webGLManager.startGL(DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER);
    updateTextArea(DEFAULT_FRAGMENT_SHADER);
    requestAnimationFrame(animationLoop);
})



