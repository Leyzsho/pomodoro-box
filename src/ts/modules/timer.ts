import Task, { ITaskInfo } from './task';
import timeEndSound from '../../audio/time-end-sound.mp3';
import breakTimeEndSound from '../../audio/breakTimeEndSound.mp3';
import { gsap } from 'gsap';

export enum TIME_STATUS {
  WORK = 'work',
  READINESS = 'readiness',
  BREAK = 'break',
  PAUSE = 'pause',
}

enum FIRST_BTN_STATUS {
  START = 'start',
  PAUSE = 'pause',
  CONTINUE = 'continue',
  START_BREAK = 'start-break',
  PAUSE_BREAK = 'pause-break',
  CONTINUE_BREAK = 'continue-break',
}

enum SECOND_BTN_STATUS {
  STOP = 'stop',
  SKIP_BREAK = 'skip-break',
  DONE = 'done',
}

export class Timer {
  // time properties

  private static currentTime: number;
  private static __defaultTime: number = 10;
  private static __defaultTimeOfCurrentTask: number = 10;
  private static TimeInterval: NodeJS.Timeout;

  private static timeElement: HTMLSpanElement | null = document.querySelector('.app__task-time');
  private static addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

  private static timeEndSound: HTMLAudioElement = document.createElement('audio');
  private static breakTimeEndSound: HTMLAudioElement = document.createElement('audio');

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

  static defaultResetBeforeReadiness(): void {
    Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.STOP;
    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = false : '';

    clearInterval(Timer.TimeInterval);
    Timer.setTimeByDefault();

    Timer.timeEndSound.remove();
    Timer.breakTimeEndSound.remove();

    Timer.currentTomato = 1;

    gsap.set(Timer.timeElement, { fontSize: 150 });
  }

  static setTaskForReadiness(task: ITaskInfo): void {
    if (Timer.timeStatus === TIME_STATUS.READINESS) {
      Timer.defaultResetBeforeReadiness();
      Timer.taskInfo = task;

      const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
      const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
      const taskInfoIntroduction: HTMLSpanElement | null = document.querySelector('.app__task-info span');
      const taskInfoName: HTMLSpanElement | null = document.querySelector('.app__task-info-name');

      title ? title.textContent = task.name : '';
      currentTomato ? currentTomato.textContent = `Помидор: ${Timer.currentTomato}` : '';
      taskInfoIntroduction ? taskInfoIntroduction.textContent = 'Задача 1 - ' : '';
      taskInfoName ? taskInfoName.textContent = task.name : '';

      if (Timer.firstBtn) {
        Timer.firstBtn.textContent = 'Старт';
        Timer.firstBtn.disabled = false;

        Timer.firstBtn.onclick = () => {
          if (Timer.firstBtnStatus === FIRST_BTN_STATUS.START) {
            Timer.start();
          } else if (Timer.firstBtnStatus === FIRST_BTN_STATUS.PAUSE) {
            Timer.pause();
          } else if (Timer.firstBtnStatus === FIRST_BTN_STATUS.CONTINUE) {
            Timer.continue();
          } else if (Timer.firstBtnStatus === FIRST_BTN_STATUS.START_BREAK) {
            Timer.startBreak();
          } else if (Timer.firstBtnStatus === FIRST_BTN_STATUS.PAUSE_BREAK) {
            Timer.pauseBreak();
          } else if (Timer.firstBtnStatus === FIRST_BTN_STATUS.CONTINUE_BREAK) {
            Timer.continueBreak();
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
          } else if (Timer.secondBtnStatus === SECOND_BTN_STATUS.DONE) {
            Timer.done();
          } else if (Timer.secondBtnStatus === SECOND_BTN_STATUS.SKIP_BREAK) {
            Timer.skipBreak();
          }
        };
      }

      if (Timer.addTimeBtn) {
        Timer.addTimeBtn.onclick = () => {
          Timer.addTimeForCurrentTask(60);
        };
      }

      localStorage.setItem('current-task-id', task.id);
    }
  }

  static clearReadiness(): void {
    Timer.defaultResetBeforeReadiness();

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
    const taskInfoIntroduction: HTMLSpanElement | null = document.querySelector('.app__task-info span');
    const taskInfoName: HTMLSpanElement | null = document.querySelector('.app__task-info-name');

    title ? title.textContent = 'Добавьте или выберите задачу' : '';
    currentTomato ? currentTomato.textContent = '' : '';
    taskInfoIntroduction ? taskInfoIntroduction.textContent = '' : '';
    taskInfoName ? taskInfoName.textContent = '' : '';

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = true : '';

    if (Timer.firstBtn) {
      Timer.firstBtn.disabled = true;
      Timer.firstBtn.textContent = 'Старт';
    }

    if (Timer.secondBtn) {
      Timer.secondBtn.disabled = true;
      Timer.secondBtn.textContent = 'Стоп';
    }

    localStorage.removeItem('current-task-id');
  }

  // general time methods

  private static setTimeByDefault(): void {
    Timer.__defaultTimeOfCurrentTask = Timer.__defaultTime;
    Timer.currentTime = Timer.__defaultTime;
    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
  }

  private static setTimeOfCurrentTask(): void {
    Timer.currentTime = Timer.__defaultTimeOfCurrentTask;
    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
  }

  private static addTimeForCurrentTask(seconds: number): void {
    Timer.__defaultTimeOfCurrentTask = Timer.currentTime + seconds;
    Timer.currentTime = Timer.__defaultTimeOfCurrentTask;
    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
  }

  private static getNormalTimeFormat(): string {
    let minutes: number = 0;
    let seconds: number = 0;
    let time = Timer.currentTime;

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

  // task time

  private static taskCompleted(): void {
    Timer.playTimeEndSound();
    Timer.taskInfo.tomatoCount -= 1;

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = true : '';

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
    Timer.breakTimeEndSound.remove();
    Timer.timeStatus = TIME_STATUS.WORK;

    Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE;
    Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');

    title ? title.textContent = Timer.taskInfo.name : '';
    currentTomato ? currentTomato.textContent = `Помидор: ${Timer.currentTomato}` : '';

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = false : '';

    Timer.setTimeOfCurrentTask();
    Timer.tick();
  }

  private static continue(): void {
    Timer.timeStatus = TIME_STATUS.WORK;

    Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.STOP;

    Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';
    Timer.secondBtn ? Timer.secondBtn.textContent = 'Стоп' : '';

    Timer.tick();
  }

  private static pause(): void {
    Timer.timeStatus = TIME_STATUS.PAUSE;

    Timer.firstBtnStatus = FIRST_BTN_STATUS.CONTINUE;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.DONE;

    Timer.firstBtn ? Timer.firstBtn.textContent = 'Продолжить' : '';
    Timer.secondBtn ? Timer.secondBtn.textContent = 'Сделано' : '';

    clearInterval(Timer.TimeInterval);
  }

  private static stop(): void {
    Timer.timeStatus = TIME_STATUS.READINESS;

    Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
    Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';
    Timer.secondBtn ? Timer.secondBtn.disabled = true : '';

    Timer.setTimeByDefault();
    clearInterval(Timer.TimeInterval);
  }

  private static done(): void {
    Timer.timeEndSound.remove();

    Timer.timeStatus = TIME_STATUS.READINESS;

    Task.removeTaskById(Timer.taskInfo.id);
  }

  private static tick(): void {
    if (Timer.timeStatus === TIME_STATUS.WORK || Timer.timeStatus === TIME_STATUS.BREAK) {
      clearInterval(Timer.TimeInterval);

      if (Timer.timeElement) {
        Timer.currentTime -= 1;
        Timer.timeElement.textContent = Timer.getNormalTimeFormat();
      }

      Timer.TimeInterval = setInterval(() => {
        if (Timer.currentTime <= 0) {
          if (Timer.timeStatus === TIME_STATUS.BREAK) {
            Timer.breakCompleted();
          } else Timer.taskCompleted();
        } else if (Timer.timeElement) {
          Timer.currentTime -= 1;
          Timer.timeElement.textContent = Timer.getNormalTimeFormat();
        }
      }, 1000);
    }
  }

  // break time

  private static setBreakTime(seconds: number): void {
    Timer.currentTime = seconds;
    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    title ? title.textContent = 'Перерыв' : '';
  }

  private static startBreak(): void {
    Timer.timeEndSound.remove();
    Timer.timeStatus = TIME_STATUS.BREAK;

    Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE_BREAK;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.SKIP_BREAK;

    Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';
    Timer.secondBtn ? Timer.secondBtn.textContent = 'Пропустить' : '';

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = false : '';

    Timer.setBreakTime(5);
    Timer.tick();
  }

  private static continueBreak(): void {
    Timer.timeStatus = TIME_STATUS.BREAK;

    Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE_BREAK;
    Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';

    Timer.tick();
  }

  private static pauseBreak(): void {
    clearInterval(Timer.TimeInterval);

    Timer.timeStatus = TIME_STATUS.BREAK;

    Timer.firstBtnStatus = FIRST_BTN_STATUS.CONTINUE_BREAK;
    Timer.firstBtn ? Timer.firstBtn.textContent = 'Продолжить' : '';

  }

  private static skipBreak(): void {
    clearInterval(Timer.TimeInterval);
    Timer.setTimeByDefault();

    Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.STOP;

    Timer.firstBtn ? Timer.firstBtn.textContent = 'пауза' : '';
    Timer.secondBtn ? Timer.secondBtn.textContent = 'Стоп' : '';

    Timer.start();
  }

  private static breakCompleted(): void {
    Timer.playBreakTimeEndSound();
    Timer.setTimeByDefault();
    clearInterval(Timer.TimeInterval);

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = true : '';

    gsap.set(Timer.timeElement, { fontSize: 90 });
    Timer.timeElement ? Timer.timeElement.textContent = 'Время вышло' : '';

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    title ? title.textContent = 'Перерыв окончен' : '';

    Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.STOP;

    Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';

    Timer.secondBtn ? Timer.secondBtn.textContent = 'Стоп' : '';
    Timer.secondBtn ? Timer.secondBtn.disabled = true: '';
  }

  // audio methods

  private static playTimeEndSound(): void {
    Timer.timeEndSound.src = timeEndSound;
    Timer.timeEndSound.loop = true;
    document.body.append(Timer.timeEndSound);
    Timer.timeEndSound.play();
  }

  private static playBreakTimeEndSound(): void {
    Timer.breakTimeEndSound.src = breakTimeEndSound;
    Timer.breakTimeEndSound.loop = true;
    document.body.append(Timer.breakTimeEndSound);
    Timer.breakTimeEndSound.play();
  }
}
