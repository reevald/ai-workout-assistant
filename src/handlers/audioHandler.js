export default class AudioHandler {
  constructor(audioConfig) {
    this.src = audioConfig.src;
    this.audioCtx = null;
    this.audioBuffer = null;
    this.isLoaded = false;
  }

  setup = async () => {
    // For handle multiple audio and multiple times play
    // Using Audio Context rather than HTML5 Audio Interface
    // To boost performance based on fps (tested: significantly more stable)
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.audioCtx = new AudioCtx();
    this.audioBuffer = await this.getFile();
  };

  getFile = async () => {
    const resp = await fetch(this.src);
    if (!resp.ok) {
      throw new Error(`HTTP error${resp.status}`);
    }
    const arrayBuffer = await resp.arrayBuffer();
    const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    this.isLoaded = true;
    return audioBuffer;
  };

  play = () => {
    if (this.audioCtx && this.audioBuffer) {
      const bufferSource = this.audioCtx.createBufferSource();
      bufferSource.buffer = this.audioBuffer;
      bufferSource.connect(this.audioCtx.destination);
      bufferSource.start();
    }
  };
}
