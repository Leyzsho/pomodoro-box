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

export enum TASK_STATUS {
  INACTIVE = 'inactive',
  INACTIVE_BREAK = 'inactive-break',
  ACTIVE_INCOMPLETE = 'active-incomplete',
  ACTIVE_COMPLETE = 'active-complete',
}

export class Timer {
  // time properties
  private static currentTime: number;
  private static TimeInterval: NodeJS.Timeout;

  private static __defaultTime: number = 10;
  private static __defaultShortBreakTime: number = 5;
  private static __defaultLongBreakTime: number = 15;

  private static timeElement: HTMLSpanElement | null = document.querySelector('.app__task-time');
  private static addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

  private static timeEndSound: HTMLAudioElement = document.createElement('audio');
  private static breakTimeEndSound: HTMLAudioElement = document.createElement('audio');

  private static triggerOfLongBreak: number = 4;

  // btn element properties

  private static firstBtn: HTMLButtonElement | null = document.querySelector('.app__task-first-btn');
  private static secondBtn: HTMLButtonElement | null = document.querySelector('.app__task-second-btn');

  // task info properties

  private static taskInfo: ITaskInfo;
  private static taskCurrentTomato: number = 1;

  // statuses properties

  public static timeStatus: TIME_STATUS = TIME_STATUS.READINESS;
  private static firstBtnStatus: FIRST_BTN_STATUS = FIRST_BTN_STATUS.START;
  private static secondBtnStatus: SECOND_BTN_STATUS = SECOND_BTN_STATUS.STOP;

  // info methods

  public static getCurrentTaskId(): string | null {
    const currentTaskIdFromLocalStorage: string | null = localStorage.getItem('current-task-id');
    if (currentTaskIdFromLocalStorage) {
      return currentTaskIdFromLocalStorage;
    }

    if (Timer.taskInfo) {
      return Timer.taskInfo.id;
    } else return null;
  }

  public static updateTaskInfo(task: ITaskInfo): void {
    Timer.taskInfo = task;

    if (Timer.timeStatus !== TIME_STATUS.BREAK) {
      const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
      title ? title.textContent = Timer.taskInfo.name : '';
    }
  }

  // readiness methods

  private static defaultResetBeforeReadiness(): void {
    Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.STOP;
    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = false : '';

    if (Timer.firstBtn) {
      Timer.firstBtn.disabled = false;
      Timer.firstBtn.textContent = 'Старт';
    }

    if (Timer.secondBtn) {
      Timer.secondBtn.disabled = true;
      Timer.secondBtn ? Timer.secondBtn.textContent = 'Стоп' : '';
    }

    clearInterval(Timer.TimeInterval);
    Timer.setTimeByDefault();

    Timer.timeEndSound.remove();
    Timer.breakTimeEndSound.remove();

    Timer.taskCurrentTomato = 1;

    gsap.set(Timer.timeElement, { fontSize: 150 });
  }

  public static setTaskForReadiness(task: ITaskInfo): void {
    const taskStatusFromLocalStorage: TASK_STATUS | null = localStorage.getItem('current-task-status') as TASK_STATUS | null;
    const taskTimeFromLocalStorage: number | null = Number(localStorage.getItem('current-task-time'));

    if (Timer.timeStatus === TIME_STATUS.READINESS) {
      if (taskStatusFromLocalStorage === TASK_STATUS.ACTIVE_COMPLETE) {
        Task.removeTaskById(task.id);
      } else {
        Timer.taskInfo = task;
        const taskCurrentTomato: number | null = Number(localStorage.getItem('current-task-tomato'));
        if (taskCurrentTomato) Timer.taskCurrentTomato = taskCurrentTomato;

        const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
        const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');

        title ? title.textContent = task.name : '';
        currentTomato ? currentTomato.textContent = `Помидор: ${Timer.taskCurrentTomato}` : '';

        if (taskStatusFromLocalStorage === TASK_STATUS.ACTIVE_INCOMPLETE) {
          Timer.timeStatus = TIME_STATUS.PAUSE;

          Timer.currentTime = taskTimeFromLocalStorage;

          Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';

          if (taskTimeFromLocalStorage !== Timer.__defaultTime && Timer.firstBtn && Timer.secondBtn) {
            Timer.firstBtn.textContent = 'Продолжить';
            Timer.firstBtnStatus = FIRST_BTN_STATUS.CONTINUE;

            Timer.secondBtn.disabled = false;
            Timer.secondBtn.textContent = 'Сделано';
            Timer.secondBtnStatus = SECOND_BTN_STATUS.DONE;
          } else {
            Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';

            Timer.secondBtn ? Timer.secondBtn.textContent = 'Стоп' : '';
            Timer.secondBtn ? Timer.secondBtn.disabled = true : '';
          }
        } else if (taskStatusFromLocalStorage === TASK_STATUS.INACTIVE_BREAK) {
          Timer.timeStatus = TIME_STATUS.BREAK;

          title ? title.textContent = 'Перерыв' : '';

          Timer.currentTime = taskTimeFromLocalStorage;

          Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';

          if (taskTimeFromLocalStorage !== Timer.__defaultShortBreakTime && Timer.firstBtn && Timer.secondBtn) {
            Timer.firstBtn.textContent = 'Продолжить';
            Timer.firstBtnStatus = FIRST_BTN_STATUS.CONTINUE_BREAK;

            Timer.secondBtn.disabled = false;
            Timer.secondBtn.textContent = 'Пропустить';
            Timer.secondBtnStatus = SECOND_BTN_STATUS.SKIP_BREAK;
          } else {
            Timer.firstBtnStatus = FIRST_BTN_STATUS.START_BREAK;
            Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';

            Timer.secondBtnStatus = SECOND_BTN_STATUS.SKIP_BREAK;
            Timer.secondBtn ? Timer.secondBtn.textContent = 'Стоп' : '';
            Timer.secondBtn ? Timer.secondBtn.disabled = true : '';
          }
        } else {
          Timer.defaultResetBeforeReadiness();
        }

        if (Timer.firstBtn) {
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

        localStorage.setItem('current-task-time', Timer.currentTime.toString());
        localStorage.setItem('current-task-tomato', Timer.taskCurrentTomato.toString());
        localStorage.setItem('current-task-id', Timer.taskInfo.id);
      }
    }
  }

  public static clearReadiness(): void {
    Timer.defaultResetBeforeReadiness();

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');

    title ? title.textContent = 'Добавьте или выберите задачу' : '';
    currentTomato ? currentTomato.textContent = '' : '';

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = true : '';

    if (Timer.firstBtn) {
      Timer.firstBtn.disabled = true;
      Timer.firstBtn.textContent = 'Старт';
    }

    if (Timer.secondBtn) {
      Timer.secondBtn.disabled = true;
      Timer.secondBtn.textContent = 'Стоп';
    }

    localStorage.removeItem('current-task-status');
    localStorage.removeItem('current-task-time');
    localStorage.removeItem('current-task-id');
    localStorage.removeItem('current-task-tomato');
  }

  // general time methods

  private static setTimeByDefault(): void {
    Timer.currentTime = Timer.__defaultTime;
    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
    localStorage.setItem('current-task-time', Timer.currentTime.toString());
  }

  private static addTimeForCurrentTask(seconds: number): void {
    Timer.currentTime += seconds;
    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
    localStorage.setItem('current-task-time', Timer.currentTime.toString());
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

  private static tick(): void {
    if (Timer.timeStatus === TIME_STATUS.WORK || Timer.timeStatus === TIME_STATUS.BREAK) {
      clearInterval(Timer.TimeInterval);

      if (Timer.timeElement) {
        Timer.currentTime -= 1;
        Timer.timeElement.textContent = Timer.getNormalTimeFormat();
        localStorage.setItem('current-task-time', Timer.currentTime.toString());
      }

      Timer.TimeInterval = setInterval(() => {
        if (Timer.currentTime <= 0) {
          if (Timer.timeStatus === TIME_STATUS.BREAK) {
            Timer.breakCompleted();
          } else Timer.tomatoOrTaskCompleted();
        } else if (Timer.timeElement) {
          Timer.currentTime -= 1;
          Timer.timeElement.textContent = Timer.getNormalTimeFormat();
          localStorage.setItem('current-task-time', Timer.currentTime.toString());
        }
      }, 1000);
    }
  }

  // task time

  private static start(): void {
    localStorage.setItem('current-task-status', TASK_STATUS.ACTIVE_INCOMPLETE);
    Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE;
    Timer.timeStatus = TIME_STATUS.WORK;
    Timer.breakTimeEndSound.remove();

    gsap.set(Timer.timeElement, { fontSize: 150 });
    Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');

    title ? title.textContent = Timer.taskInfo.name : '';
    currentTomato ? currentTomato.textContent = `Помидор: ${Timer.taskCurrentTomato}` : '';

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = false : '';

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
    clearInterval(Timer.TimeInterval);
    localStorage.setItem('current-task-status', TASK_STATUS.INACTIVE);

    Timer.timeStatus = TIME_STATUS.READINESS;
    Timer.firstBtnStatus = FIRST_BTN_STATUS.START;

    Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';
    Timer.secondBtn ? Timer.secondBtn.disabled = true : '';

    Timer.setTimeByDefault();
  }

  private static done(): void {
    Timer.timeStatus = TIME_STATUS.READINESS;
    Timer.timeEndSound.remove();

    Task.removeTaskById(Timer.taskInfo.id);
  }

  private static tomatoOrTaskCompleted(): void {
    clearInterval(Timer.TimeInterval);
    localStorage.setItem('current-task-time', Timer.__defaultTime.toString());

    const taskTomatoPassed: number | null = Number(localStorage.getItem('task-tomato-passed'));
    if (taskTomatoPassed) {
      localStorage.setItem('task-tomato-passed', (taskTomatoPassed + 1).toString());
    } else localStorage.setItem('task-tomato-passed', (1).toString());

    Timer.playTimeEndSound();

    Timer.taskInfo.tomatoCount -= 1;

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = true : '';

    gsap.set(Timer.timeElement, { fontSize: 90 });
    Timer.timeElement ? Timer.timeElement.textContent = 'Время вышло' : '';

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');

    if (Timer.taskInfo.tomatoCount <= 0) {
      localStorage.setItem('current-task-status', TASK_STATUS.ACTIVE_COMPLETE);
      Timer.timeStatus = TIME_STATUS.READINESS;
      Timer.firstBtnStatus = FIRST_BTN_STATUS.START;
      Timer.secondBtnStatus = SECOND_BTN_STATUS.DONE;

      title ? title.textContent = 'Задача завершена' : '';

      Timer.firstBtn ? Timer.firstBtn.textContent = 'Старт' : '';
      Timer.firstBtn ? Timer.firstBtn.disabled = true : '';
      Timer.secondBtn ? Timer.secondBtn.textContent = 'Завершить' : '';
    } else {
      localStorage.setItem('current-task-status', TASK_STATUS.INACTIVE_BREAK);
      localStorage.setItem('current-task-time', Timer.__defaultShortBreakTime.toString());
      Timer.timeStatus = TIME_STATUS.BREAK;
      Timer.firstBtnStatus = FIRST_BTN_STATUS.START_BREAK;
      Timer.secondBtnStatus = SECOND_BTN_STATUS.DONE;

      title ? title.textContent = `${Timer.taskCurrentTomato} помидор истёк` : '';

      Timer.taskCurrentTomato += 1;
      localStorage.setItem('current-task-tomato', Timer.taskCurrentTomato.toString());

      Timer.firstBtn ? Timer.firstBtn.textContent = 'Перерыв' : '';
      Timer.secondBtn ? Timer.secondBtn.textContent = 'Завершить' : '';

      Task.updateTomatoCountById(Timer.taskInfo.id);
    }
  }

  // break time

  private static setBreakTimeByDefault(): void {
    const taskTomatoPassed: number | null = Number(localStorage.getItem('task-tomato-passed'));
    if (taskTomatoPassed && taskTomatoPassed >= Timer.triggerOfLongBreak) {
      Timer.currentTime = Timer.__defaultLongBreakTime;
      localStorage.setItem('task-tomato-passed', (0).toString());
    } else Timer.currentTime = Timer.__defaultShortBreakTime;

    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
    localStorage.setItem('current-task-time', Timer.currentTime.toString());
  }

  // private static setBreakTimeByDefault(seconds: number): void {}

  private static startBreak(): void {
    Timer.timeEndSound.remove();
    Timer.setBreakTimeByDefault();

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');

    if (Timer.currentTime === Timer.__defaultShortBreakTime) title ? title.textContent = 'Перерыв' : '';
    else title ? title.textContent = 'Длинный перерыв' : '';

    gsap.set(Timer.timeElement, { fontSize: 150 });

    Timer.timeStatus = TIME_STATUS.BREAK;
    Timer.firstBtnStatus = FIRST_BTN_STATUS.PAUSE_BREAK;
    Timer.secondBtnStatus = SECOND_BTN_STATUS.SKIP_BREAK;

    Timer.firstBtn ? Timer.firstBtn.textContent = 'Пауза' : '';
    Timer.secondBtn ? Timer.secondBtn.textContent = 'Пропустить' : '';

    Timer.addTimeBtn ? Timer.addTimeBtn.disabled = false : '';

    Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
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
    clearInterval(Timer.TimeInterval);
    Timer.playBreakTimeEndSound();
    Timer.setTimeByDefault();

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
