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

  initConstants() {
    this.body = document.body;
    this.exitButton = this.body.querySelector('.section__exit');
    this.main = this.body.querySelector('.main');
    this.viewIcon = this.body.querySelector('#view');
    this.input = this.body.querySelector('#input');
    this.settingsIcon = this.body.querySelector('#settings');
    this.paperclip = this.body.querySelector('#paperclip');
    this.fileControl = this.body.querySelector('.input-file');
    this.preview = this.body.querySelector('#preview');
  }

  initListeners() {
    this.addExitListener();
    this.addViewListener();
    this.addPaperclipListener();
    this.addInputListener();
    this.addChangeListener();
    this.addSettingsListener();
    this.addFilesListener();
    this.addVideosListener();
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
      this.name = file.name;
      if (file.type.startsWith('image')) {
        console.log(file.type);
        this.type = 'image';
      } else if (file.type.startsWith('video')) {
        console.log(file.type);
        this.type = 'video';
      } else if (file.type.startsWith('audio')) {
        console.log(file.type);
        this.type = 'audio';
      }
      const blob = URL.createObjectURL(file);
      this.text = await new Response(blob).text();
      const obj = {
        name: this.name,
        text: this.text,
        type: this.type,
      };
      const { type, text } = await this.api.sendMedia(obj);
      console.log(type, text);
    });
  }

  addPaperclipListener() {
    this.paperclip.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.fileControl.dispatchEvent(new MouseEvent('click'));
    });
  }

  addInputListener() {
    this.input.addEventListener('keydown', async (e) => {
      if (e.code === 'Enter' && this.input.value !== '') {
        this.type = this.input.value.startsWith('http') || this.input.value.startsWith('https') ? 'link' : 'text';
        const { text, type, timestamp } = await this.api.request('POST', {
          type: this.type,
          text: this.input.value,
        });
        this.gui.createMessage(text, type, timestamp);
        this.input.value = '';
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
        if (type === 'messages' || type === 'links') {
          this.array = await this.api.request('GET', type);
          this.body.append(this.gui.createFilesWindow(this.array));
          document.getElementById('close').addEventListener('click', () => {
            this.body.querySelector('.files-window').remove();
          });
        }
      });
    });
  }

  addVideosListener() {
    Array.from(this.body.querySelectorAll('.file')).forEach((file) => {
      file.addEventListener('click', async () => {
        if (document.querySelector('.files-window') !== null) return;
        const type = file.querySelector('svg').id;
        if (type === 'videos') {
          this.body.append(this.gui.createFilesWindow(this.videoArray));
          document.getElementById('close').addEventListener('click', () => {
            this.body.querySelector('.files-window').remove();
          });
        }
      });
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
}

// Отображение аудио/видео/картинок в чате
// Смайлики
// Скачивание при отправке
