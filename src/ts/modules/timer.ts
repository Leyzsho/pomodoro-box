import Task, { ITaskInfo } from './task';
import timeEndSound from '../../audio/time-end-sound.mp3';
import { gsap } from 'gsap';

export enum TIME_STATUS {
  WORK = 'work',
  READINESS = 'readiness',
  SHORT_BREAK = 'short-break',
  BIG_BREAK = 'big-break',
  PAUSE = 'pause',
}

enum FIRST_BTN_STATUS {
  START = 'start',
  PAUSE = 'pause',
  CONTINUE = 'continue',
  START_BREAK = 'start-break',
}

enum SECOND_BTN_STATUS {
  STOP = 'stop',
  SKIP = 'skip',
  DONE = 'done',
}

export class Timer {
  // time properties

  private static timeElement: HTMLSpanElement | null = document.querySelector('.app__task-time');
  private static time: number;
  private static TimeInterval: NodeJS.Timeout;
  private static timeEndSound: HTMLAudioElement = document.createElement('audio');

  // tomato properties

  private static currentTomato: number = 1;

  // btn element properties

  private static firstBtn: HTMLButtonElement | null = document.querySelector('.app__task-first-btn');
  private static secondBtn: HTMLButtonElement | null = document.querySelector('.app__task-second-btn');

  // task methods

  private static taskInfo: ITaskInfo;

  // statuses properties

  public static timeStatus: TIME_STATUS = TIME_STATUS.READINESS;
  private static firstBtnStatus: FIRST_BTN_STATUS = FIRST_BTN_STATUS.START;
  private static secondBtnStatus: SECOND_BTN_STATUS = SECOND_BTN_STATUS.STOP;

  // info methods

  static getCurrentTaskId(): string | null {
    const id: string | null = localStorage.getItem('current-task-id');
    return id;
  }

  // readiness methods

  static defaultPropertiesReset(): void {
    Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.STOP;

    clearInterval(Timer.TimeInterval);
    Timer.setTime();

    Timer.timeEndSound.remove();

    Timer.currentTomato = 1;

    gsap.set(Timer.timeElement, { fontSize: 150 });
  }

  static setTaskForReadiness(task: ITaskInfo): void {
    if (Timer.timeStatus === TIME_STATUS.READINESS) {
      Timer.defaultPropertiesReset();
      Timer.taskInfo = task;

      const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
      const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
      const taskInfoIntroduction: HTMLSpanElement | null = document.querySelector('.app__task-info span');
      const taskInfoName: HTMLSpanElement | null = document.querySelector('.app__task-info-name');

      title ? title.textContent = task.name : '';
      currentTomato ? currentTomato.textContent = `Помидор: ${Timer.currentTomato}` : '';
      taskInfoIntroduction ? taskInfoIntroduction.textContent = 'Задача 1 - ' : '';
      taskInfoName ? taskInfoName.textContent = task.name : '';

      const addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

      addTimeBtn ? addTimeBtn.disabled = false : '';

      if (Timer.firstBtn) {
        Timer.firstBtn.textContent = 'Старт';
        Timer.firstBtn.disabled = false;

        Timer.firstBtn.onclick = () => {
          if (Timer.firstBtnStatus === FIRST_BTN_STATUS.START) {
            Timer.start();

            Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE;
            Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';
          } else if (Timer.firstBtnStatus === FIRST_BTN_STATUS.PAUSE) {
            Timer.pause();

            Timer.firstBtnStatus = FIRST_BTN_STATUS.CONTINUE;
            Timer.firstBtn ? Timer.firstBtn.textContent = 'Продолжить' : '';
          } else if (Timer.firstBtnStatus === FIRST_BTN_STATUS.CONTINUE) {
            Timer.continue();

            Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE;
            Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';
          }
          Timer.secondBtn ? Timer.secondBtn.disabled = false : '';
        };
      }

      if (Timer.secondBtn) {
        Timer.secondBtn.disabled = true;
        Timer.secondBtn.textContent = 'Стоп';

        Timer.secondBtn.onclick = () => {
          if (Timer.secondBtnStatus === SECOND_BTN_STATUS.STOP) {
            Timer.stop();

            Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
            Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';
            Timer.secondBtn ? Timer.secondBtn.disabled = true : '';
          } else if (Timer.secondBtnStatus === SECOND_BTN_STATUS.DONE) {
            Timer.timeEndSound.remove();

            Timer.timeStatus = TIME_STATUS.READINESS;

            Task.removeTaskById(Timer.taskInfo.id);
          }
        };
      }

      localStorage.setItem('current-task-id', task.id);
    }
  }

  static clearReadiness(): void {
    Timer.defaultPropertiesReset();

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
    const taskInfoIntroduction: HTMLSpanElement | null = document.querySelector('.app__task-info span');
    const taskInfoName: HTMLSpanElement | null = document.querySelector('.app__task-info-name');

    title ? title.textContent = 'Добавьте или выберите задачу' : '';
    currentTomato ? currentTomato.textContent = '' : '';
    taskInfoIntroduction ? taskInfoIntroduction.textContent = '' : '';
    taskInfoName ? taskInfoName.textContent = '' : '';

    const addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

    if (Timer.firstBtn) {
      Timer.firstBtn.disabled = true;
      Timer.firstBtn.textContent = 'Старт';
    }

    if (Timer.secondBtn) {
      Timer.secondBtn.disabled = true;
      Timer.secondBtn.textContent = 'Стоп';
    }

    addTimeBtn ? addTimeBtn.disabled = true : '';

    localStorage.removeItem('current-task-id');
  }

  // time methods

  private static setTime(): void {
    Timer.time = 10;
    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
  }

  private static getNormalTimeFormat(): string {
    let minutes: number = 0;
    let seconds: number = 0;
    let time = Timer.time;

    if (time > 59) {
      while (time > 59) {
        minutes += 1;
        time -= 60;
      }
      seconds = time;

      if (seconds > 9) {
        return `${minutes}:${seconds}`;
      } else return `${minutes}:0${seconds}`;

    } else {
      seconds = time;
      return seconds.toString();
    }
  }

  private static taskCompleted(): void {
    Timer.playTimeEndSound();
    Timer.taskInfo.tomatoCount -= 1;

    gsap.set(Timer.timeElement, { fontSize: 90 });
    Timer.timeElement ? Timer.timeElement.textContent = 'Время вышло' : '';

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');

    clearInterval(Timer.TimeInterval);
    if (Timer.taskInfo.tomatoCount <= 0) {
      Timer.timeStatus = TIME_STATUS.READINESS;
      Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
      Timer.secondBtnStatus = SECOND_BTN_STATUS.DONE;

      title ? title.textContent = 'Задача завершена' : '';

      Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';
      Timer.firstBtn ? Timer.firstBtn.disabled = true : '';
      Timer.secondBtn ? Timer.secondBtn.textContent = 'Завершить' : '';
    } else {
      Timer.firstBtnStatus = FIRST_BTN_STATUS.START_BREAK;
      Timer.secondBtnStatus = SECOND_BTN_STATUS.DONE;

      title ? title.textContent = `${Timer.currentTomato} помидор истёк` : '';

      Timer.currentTomato += 1;

      Timer.firstBtn ? Timer.firstBtn.textContent = 'Перерыв' : '';
      Timer.secondBtn ? Timer.secondBtn.textContent = 'Завершить' : '';

      Task.updateTomatoCountById(Timer.taskInfo.id);
    }
  }

  private static start(): void {
    Timer.timeStatus = TIME_STATUS.WORK;
    Timer.setTime();
    Timer.tick();
  }

  private static continue(): void {
    Timer.timeStatus = TIME_STATUS.WORK;
    Timer.tick();
  }

  private static pause(): void {
    Timer.timeStatus = TIME_STATUS.PAUSE;
    clearInterval(Timer.TimeInterval);
  }

  private static stop(): void {
    Timer.timeStatus = TIME_STATUS.READINESS;
    Timer.setTime();
    clearInterval(Timer.TimeInterval);
  }

  private static tick(): void {
    clearInterval(Timer.TimeInterval);

    if (Timer.timeStatus === TIME_STATUS.WORK) {
      if (Timer.timeElement) {
        Timer.time -= 1;
        Timer.timeElement.textContent = Timer.getNormalTimeFormat();
      }

      Timer.TimeInterval = setInterval(() => {
        if (Timer.time <= 0) {
          Timer.taskCompleted();
        } else if (Timer.timeElement) {
          Timer.time -= 1;
          Timer.timeElement.textContent = Timer.getNormalTimeFormat();
        }
      }, 1000);
    }
  }

  // break
  private static startBreak(): void {

  }

  private static breakCompleted(): void {
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
    if (currentTomato?.textContent) {
      currentTomato.textContent = `Помидор: ${Timer.currentTomato}`;
    }
  }

  // audio methods

  private static playTimeEndSound(): void {
    Timer.timeEndSound.src = timeEndSound;
    Timer.timeEndSound.loop = true;
    document.body.append(Timer.timeEndSound);
    Timer.timeEndSound.play();
  }
}
