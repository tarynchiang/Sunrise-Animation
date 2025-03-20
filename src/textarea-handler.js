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

const textAreaKeyupHandler = (event) => {
    const newFragmentShader = event.target.value;
    webGLManager.isProgramReady = false;
    webGLManager.setShaders(DEFAULT_VERTEX_SHADER, newFragmentShader);
    updateTextArea(newFragmentShader);
}