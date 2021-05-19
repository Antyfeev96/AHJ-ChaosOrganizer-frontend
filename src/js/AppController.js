/* eslint-disable prefer-destructuring */
export default class AppController {
  constructor(gui, api) {
    this.gui = gui;
    this.api = api;
  }

  init() {
    this.gui.init();
    this.initConstants();
    this.initListeners();
  }

  async initConstants() {
    this.body = document.body;
    this.container = this.body.querySelector('.container');
    this.exitButton = this.body.querySelector('.section__exit');
    this.main = this.body.querySelector('.main');
    this.viewIcon = this.body.querySelector('#view');
    this.input = this.body.querySelector('#input');
    this.camera = this.body.querySelector('#camera');
    this.microphone = this.body.querySelector('#microphone');
    this.settingsIcon = this.body.querySelector('#settings');
    this.smileIcon = this.body.querySelector('#smile');
    this.paperclip = this.body.querySelector('#paperclip');
    this.fileControl = this.body.querySelector('.input-file');
    this.preview = this.body.querySelector('#preview');
    this.form = this.body.querySelector('#form');
    this.submit = this.body.querySelector('#submit');
    // await this.changeQuantity();
    this.watchGeolocation();
  }

  initListeners() {
    this.addExitListener();
    this.addViewListener();
    this.addPaperclipListener();
    this.addInputListener();
    this.addChangeListener();
    this.addSettingsListener();
    this.addFilesListener();
    this.addMediaListener();
    this.addDropListener();
    this.emojiListener();
    this.cameraListener();
    this.microphoneListener();
    // this.submitListener();
  }

  addExitListener() {
    this.exitButton.addEventListener('click', () => {
      this.exitButton.closest('.section').style.display = 'none';
      this.main.style.width = `${100}%`;
      this.viewIcon.classList.toggle('focus');
      this.getCoords();
    });
  }

  addViewListener() {
    this.viewIcon.addEventListener('click', () => {
      switch (this.viewIcon.classList.contains('focus')) {
        case true:
          this.exitButton.closest('.section').style.display = 'none';
          this.viewIcon.classList.remove('focus');
          this.main.style.width = `${100}%`;
          break;
        case false:
          this.exitButton.closest('.section').style.display = 'block';
          this.viewIcon.classList.add('focus');
          this.main.style.width = `${70}%`;
          break;
        default:
          break;
      }
      this.getCoords();
    });
  }

  addChangeListener() {
    this.fileControl.addEventListener('change', async () => {
      const file = this.fileControl.files[0];
      const formData = new FormData();
      formData.append('file', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', 'http://localhost:7070/');
      xhr.send(formData);
      xhr.onload = () => {
        if (xhr.status !== 200) {
          console.log(`Ошибка ${xhr.status}: ${xhr.statusText}`);
        } else {
          const response = xhr.response;
          console.log(response);
          this.img = document.createElement('img');
          this.img.src = `../${response}`;
          this.body.append(this.img);
          console.log(`Готово, получили ${xhr.response.length} байт`);
        }
      };
    });
  }

  // submitListener(file) {
  //   this.body.querySelector('#form').addEventListener('submit', async (e) => {
  //     e.preventDefault();
  //     const file = e.target.elements[0].files[0];
  //     const { text, type, timestamp } = await this.api.sendImg(file);
  //     console.log(text, type, timestamp);
  //     this.gui.createMessage(text, type, timestamp);
  //   });
  // }

  // async sendFile(file) {
  //   this.name = file.name;
  //   if (file.type.startsWith('image')) {
  //     this.type = 'image';
  //   } else if (file.type.startsWith('video')) {
  //     this.type = 'video';
  //   } else if (file.type.startsWith('audio')) {
  //     this.type = 'audio';
  //   }
  //   const blob = URL.createObjectURL(file);
  //   this.text = await new Response(blob).text();
  //   const obj = {
  //     name: this.name,
  //     text: this.text,
  //     type: this.type,
  //   };
  // }

  addPaperclipListener() {
    this.paperclip.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.fileControl.dispatchEvent(new MouseEvent('click'));
    });
  }

  addInputListener() {
    this.input.addEventListener('keydown', async (e) => {
      if (e.code === 'Enter' && this.input.value !== '') {
        this.type = this.input.value.startsWith('http') || this.input.value.startsWith('https') ? 'link' : 'message';
        const {
          text,
          type,
          timestamp,
        } = await this.api.request('POST', {
          type: this.type,
          text: this.input.value,
        });
        this.gui.createMessage(text, type, timestamp);
        this.input.value = '';
        await this.changeQuantity();
      }
    });
  }

  addSettingsListener() {
    this.settingsIcon.addEventListener('click', () => {
      switch (this.body.querySelector('.settings')) {
        case null:
          this.gui.createSettings();
          this.getCoords();
          break;
        default:
          this.body.querySelector('.settings').remove();
          break;
      }
    });
  }

  addFilesListener() {
    Array.from(this.body.querySelectorAll('.file')).forEach((file) => {
      file.addEventListener('click', async () => {
        if (document.querySelector('.files-window') !== null) return;
        const type = file.querySelector('svg').id;
        if (type === 'message' || type === 'link') {
          this.array = await this.api.request('GET', {
            text: `give-${type}`,
            type,
          });
          this.body.append(this.gui.createFilesWindow(this.array));
          document.getElementById('close').addEventListener('click', () => {
            this.body.querySelector('.files-window').remove();
          });
        }
        await this.changeQuantity();
      });
    });
  }

  addMediaListener() {
    Array.from(this.body.querySelectorAll('.file')).forEach((file) => {
      file.addEventListener('click', async () => {
        if (document.querySelector('.files-window') !== null) return;
        const type = file.querySelector('svg').id;
        if (type === 'video' || type === 'image' || type === 'audio') {
          this.array = await this.api.request('GET', {
            text: `give-${type}`,
            type,
          });
          this.body.append(this.gui.createFilesWindow(this.array));
          this.files = this.body.querySelector('.files-window');
          document.getElementById('close').addEventListener('click', () => {
            this.body.querySelector('.files-window').remove();
          });
          document.addEventListener('mouseover', (e) => {
            this.lazyLoad(e);
          });
        }
        await this.changeQuantity();
      });
    });
  }

  cameraListener() {
    this.camera.addEventListener('click', async () => {
      if (!this.recorder || this.recorder.state === 'inactive') {
        this.videoStream();
      } else {
        this.recorder.stop();
        this.stream.getTracks().forEach((track) => track.stop());
      }
    });
  }

  microphoneListener() {
    this.microphone.addEventListener('click', async () => {
      if (!this.recorder || this.recorder.state === 'inactive') {
        this.audioStream();
      } else {
        this.recorder.stop();
        this.stream.getTracks().forEach((track) => track.stop());
      }
    });
  }

  async videoStream() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    this.recorder = new MediaRecorder(this.stream);
    this.chunks = [];

    this.recorder.addEventListener('start', () => {
      this.camera.classList.toggle('active');
      console.log('recording started');
    });

    this.recorder.addEventListener('dataavailable', (event) => {
      this.chunks.push(event.data);
    });

    this.recorder.addEventListener('stop', async () => {
      this.camera.classList.toggle('active');
      console.log('recording stopped');
      const blob = new Blob(this.chunks);
      this.src = URL.createObjectURL(blob);

      const obj = {
        name: 'video message',
        text: this.src,
        type: 'video',
      };

      const { text, type, timestamp } = await this.api.sendMedia(obj);
      this.gui.createMessage(text, type, timestamp);
    });

    this.recorder.start();
  }

  async audioStream() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    this.recorder = new MediaRecorder(this.stream);
    this.chunks = [];

    this.recorder.addEventListener('start', () => {
      this.microphone.classList.toggle('active');
      console.log('recording started');
    });

    this.recorder.addEventListener('dataavailable', (event) => {
      this.chunks.push(event.data);
    });

    this.recorder.addEventListener('stop', async () => {
      this.microphone.classList.toggle('active');
      console.log('recording stopped');
      const blob = new Blob(this.chunks);
      this.src = URL.createObjectURL(blob);

      const obj = {
        name: 'voice message',
        text: this.src,
        type: 'audio',
      };

      const { text, type, timestamp } = await this.api.sendMedia(obj);
      this.gui.createMessage(text, type, timestamp);
    });

    this.recorder.start();
  }

  addDropListener() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
      this.container.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    this.container.addEventListener('drop', async (e) => {
      this.data = e.dataTransfer;
      this.file = this.data.files[0]; // линтер ругается на эту строчку, но на мой взгляд,
      // она более читабельна, чем [this.file] = this.data.files
      await this.sendFile(this.file);
      await this.changeQuantity();
    });
  }

  emojiListener() {
    this.body.addEventListener('mouseover', (event) => {
      if (event.target.id === 'smile' && this.body.querySelector('.emoji') === null) {
        this.gui.createEmojiBox();
        this.emoji = document.querySelector('.emoji');
        this.smileCoords = this.smileIcon.getBoundingClientRect();
        this.emoji.style.top = `${this.smileCoords.y - 130}px`;
        this.emoji.style.left = `${this.smileCoords.x - 60}px`;
        this.smileIcon.classList.add('active');
        this.emoji.addEventListener('click', (e) => {
          this.input.value += e.target.textContent;
        });
      }
    });

    this.body.addEventListener('mouseover', (event) => {
      if (this.emoji) {
        if ((event.target.closest('.icon') || event.target.closest('.emoji')) === null) {
          this.emoji.remove();
          this.smileIcon.classList.remove('active');
        }
      }
    });
  }

  getCoords() {
    if (this.body.querySelector('.settings') === null) return;
    this.settingsIcon = this.body.querySelector('#settings');
    this.settings = this.body.querySelector('.settings');
    this.coords = this.settingsIcon.getBoundingClientRect();
    this.settings.style.top = `${this.coords.top + 20}px`;
    this.settings.style.left = `${this.coords.left - 150}px`;
  }

  // async changeQuantity() {
  //   const types = ['message', 'link', 'image', 'video', 'audio'];
  //   types.forEach(async (type) => {
  //     const length = await this.api.giveLength(type);
  //     const number = length[1];
  //     const el = this.body.querySelector(`#${type}`).nextSibling;
  //     el.textContent = '';
  //     el.textContent = `${number} ${type}`;
  //   });
  // }

  watchGeolocation() {
    if (navigator.geolocation) {
      this.options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

      const success = (pos) => {
        const { coords } = pos;
        if (this.body.querySelector('.section__coords')) {
          this.body.querySelector('.section__coords').remove();
        }
        this.gui.createSectionCoords(coords.latitude, coords.longitude, coords.accuracy);
      };

      const error = (err) => {
        console.warn(`ERROR(${err.code}): ${err.message}`);
      };

      this.geoId = navigator.geolocation.watchPosition(success, error, this.options);
    }
  }

  lazyLoad(e) {
    this.arr = Array.from(this.body.querySelectorAll('.files-window__item'));
    const index = this.arr.indexOf(e.target.closest('.files-window__item'));
    if (index % 5 === 4 || index === 0) {
      for (let i = 0; i < this.arr.indexOf(e.target.closest('.files-window__item')) + 5; i += 1) {
        const element = this.arr[i].querySelector('img');
        if (element !== null) {
          this.arr[i].querySelector('img').src = this.arr[i].querySelector('img').src.replace('lazy', '');
        } else {
          this.arr[i].querySelector('source').src = this.arr[i].querySelector('source').src.replace('lazy', '');
        }
      }
    }
  }
}
