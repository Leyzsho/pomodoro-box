import Task, { ITaskInfo } from './task';
import timeEndSound from '../../audio/time-end-sound.mp3';
import breakTimeEndSound from '../../audio/breakTimeEndSound.mp3';

import { gsap } from 'gsap';

import tippy from 'tippy.js';
import { hideAll } from 'tippy.js';
import 'tippy.js/animations/shift-toward.css';

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

enum NOTICES_STATUS {
  ON = 'on',
  OFF = 'off',
}

enum SETTINGS_WRAPPER {
  TOMATO_TIME = 'tomato-time',
  SHORT_BREAK_TIME = 'short-break-time',
  LONG_BREAK_TIME = 'long-break-time',
  FREQUENCY_OF_LONG_BREAK = 'frequency-of-long-break',
}
export class Timer {
  // time properties
  private static currentTime: number;
  private static TimeInterval: NodeJS.Timeout;

  private static timeElement: HTMLSpanElement | null = document.querySelector('.app__task-time');
  private static addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

  private static timeEndSound: HTMLAudioElement = document.createElement('audio');
  private static breakTimeEndSound: HTMLAudioElement = document.createElement('audio');

  // btn element properties

  private static firstBtn: HTMLButtonElement | null = document.querySelector('.app__task-first-btn');
  private static secondBtn: HTMLButtonElement | null = document.querySelector('.app__task-second-btn');

  // settings properties

  private static __defaultTime: number = 10;
  private static __defaultShortBreakTime: number = 5;
  private static __defaultLongBreakTime: number = 15;
  private static __noticesStatus: NOTICES_STATUS = NOTICES_STATUS.ON;
  private static __frequencyOfLongBreak: number = 4;

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

  // settings

  public static createSettingsMenu(): void {
    const taskSettingsTrigger: HTMLButtonElement | null = document.querySelector('.app__task-settings-trigger');
    const taskSettingsMenu: HTMLDivElement = document.createElement('div');

    taskSettingsMenu.classList.add('app__task-settings-menu');

    const tomatoTimeBtn: HTMLButtonElement = document.createElement('button');
    const shortBreakTimeBtn: HTMLButtonElement = document.createElement('button');
    const longBreakTimeBtn: HTMLButtonElement = document.createElement('button');
    const frequencyOfLongBreakBtn: HTMLButtonElement = document.createElement('button');
    const switchingNoticesWrapper: HTMLDivElement = document.createElement('div');
    const switchingNoticesBtn: HTMLButtonElement = document.createElement('button');

    tomatoTimeBtn.classList.add('app__task-settings-btn');
    shortBreakTimeBtn.classList.add('app__task-settings-btn');
    longBreakTimeBtn.classList.add('app__task-settings-btn');
    frequencyOfLongBreakBtn.classList.add('app__task-settings-btn');
    switchingNoticesWrapper.classList.add('app__task-settings-switching-notices-wrapper');
    switchingNoticesBtn.classList.add('app__task-settings-switching-notices-btn');

    tomatoTimeBtn.textContent = 'изменить время помидора';
    shortBreakTimeBtn.textContent = 'изменить время короткого перерыва';
    longBreakTimeBtn.textContent = 'изменить время длинного перерыва';
    frequencyOfLongBreakBtn.textContent = 'изменить чистоту длинного перерыва';
    switchingNoticesWrapper.textContent = 'уведомления';

    const noticesStatusFromLocalStorage: string | null = localStorage.getItem('settings-notices');

    if (noticesStatusFromLocalStorage) {
      if (noticesStatusFromLocalStorage === 'on') {
        switchingNoticesBtn.classList.add('app__task-settings-switching-notices-btn--on');

        Timer.timeEndSound.muted = false;
        Timer.breakTimeEndSound.muted = false;
      } else if (noticesStatusFromLocalStorage === 'off') {
        switchingNoticesBtn.classList.remove('app__task-settings-switching-notices-btn--on');

        Timer.timeEndSound.muted = true;
        Timer.breakTimeEndSound.muted = true;
      }
    } else switchingNoticesBtn.classList.add('app__task-settings-switching-notices-btn--on');

    switchingNoticesBtn.addEventListener('click', () => {
      if (Timer.__noticesStatus === NOTICES_STATUS.ON) {
        localStorage.setItem('settings-notices', NOTICES_STATUS.OFF);
        Timer.__noticesStatus = NOTICES_STATUS.OFF;

        switchingNoticesBtn.classList.remove('app__task-settings-switching-notices-btn--on');

        Timer.timeEndSound.muted = true;
        Timer.breakTimeEndSound.muted = true;
      } else if (Timer.__noticesStatus === NOTICES_STATUS.OFF) {
        localStorage.setItem('settings-notices', NOTICES_STATUS.ON);
        Timer.__noticesStatus = NOTICES_STATUS.ON;

        switchingNoticesBtn.classList.add('app__task-settings-switching-notices-btn--on');

        Timer.timeEndSound.muted = false;
        Timer.breakTimeEndSound.muted = false;
      }
    });

    switchingNoticesBtn.append(document.createElement('span'));
    switchingNoticesWrapper.prepend(switchingNoticesBtn);

    taskSettingsMenu.append(tomatoTimeBtn);
    taskSettingsMenu.append(shortBreakTimeBtn);
    taskSettingsMenu.append(longBreakTimeBtn);
    taskSettingsMenu.append(frequencyOfLongBreakBtn);
    taskSettingsMenu.append(switchingNoticesWrapper);

    if (taskSettingsTrigger) {
      tippy(taskSettingsTrigger, {
        content: taskSettingsMenu,
        placement: 'bottom',
        interactive: true,
        animation: 'shift-toward',
        trigger: 'click',
        offset: [-89, 15],
      });
    }

    // wrappers for changing

    const tomatoTimeWrapperForChanging: HTMLDivElement = Timer.createWrapperForSettingsChanging(SETTINGS_WRAPPER.TOMATO_TIME, tomatoTimeBtn.offsetHeight);
    const shortBreakTimeWrapperForChanging: HTMLDivElement = Timer.createWrapperForSettingsChanging(SETTINGS_WRAPPER.SHORT_BREAK_TIME, shortBreakTimeBtn.offsetHeight);
    const longBreakTimeWrapperForChanging: HTMLDivElement = Timer.createWrapperForSettingsChanging(SETTINGS_WRAPPER.LONG_BREAK_TIME, longBreakTimeBtn.offsetHeight);
    const frequencyOfLongBreakWrapperForChanging: HTMLDivElement = Timer.createWrapperForSettingsChanging(SETTINGS_WRAPPER.FREQUENCY_OF_LONG_BREAK, frequencyOfLongBreakBtn.offsetHeight);

    tippy(tomatoTimeBtn, {
      content: tomatoTimeWrapperForChanging,
      placement: 'left',
      interactive: true,
      animation: 'shift-toward',
      trigger: 'click',
      offset: [0, 15],
    });

    tippy(shortBreakTimeBtn, {
      content: shortBreakTimeWrapperForChanging,
      placement: 'left',
      interactive: true,
      animation: 'shift-toward',
      trigger: 'click',
      offset: [0, 15],
    });

    tippy(longBreakTimeBtn, {
      content: longBreakTimeWrapperForChanging,
      placement: 'left',
      interactive: true,
      animation: 'shift-toward',
      trigger: 'click',
      offset: [0, 15],
    });

    tippy(frequencyOfLongBreakBtn, {
      content: frequencyOfLongBreakWrapperForChanging,
      placement: 'left',
      interactive: true,
      animation: 'shift-toward',
      trigger: 'click',
      offset: [0, 15],
    });
  }

  private static createWrapperForSettingsChanging(wrapperParam: SETTINGS_WRAPPER, height: number): HTMLDivElement {
    const wrapper: HTMLDivElement = document.createElement('div');
    const input: HTMLInputElement = document.createElement('input');

    wrapper.classList.add('app__task-settings-changing-wrapper');
    input.classList.add('app__task-settings-changing-input');

    const confirmChangingBtn: HTMLButtonElement = document.createElement('button');
    const confirmChangingSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const confirmChangingUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    confirmChangingBtn.classList.add('app__task-settings-changing-confirm');
    gsap.set(input, { height });

    confirmChangingUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#confirm-changing');

    confirmChangingSvg.append(confirmChangingUse);
    confirmChangingBtn.append(confirmChangingSvg);

    wrapper.append(input);
    wrapper.append(confirmChangingBtn);

    if (wrapperParam === SETTINGS_WRAPPER.TOMATO_TIME) {
      input.placeholder = `в минутах(текущ. ${Timer.__defaultTime})`;

      confirmChangingBtn.addEventListener('click', () => {
        Timer.__defaultTime = Number(input.value.replace(/[^0-9]/g,''));
        Timer.setTimeByDefault();
        localStorage.setItem('settings-default-time', Timer.__defaultTime.toString());
      });
    } else if (wrapperParam === SETTINGS_WRAPPER.SHORT_BREAK_TIME) {
      input.placeholder = `в минутах(текущ. ${Timer.__defaultShortBreakTime})`;

      confirmChangingBtn.addEventListener('click', () => {
        Timer.__defaultShortBreakTime = Number(input.value.replace(/[^0-9]/g,''));
        Timer.setBreakTimeByDefault();
        localStorage.setItem('settings-default-short-break-time', Timer.__defaultShortBreakTime.toString());
      });
    } else if (wrapperParam === SETTINGS_WRAPPER.LONG_BREAK_TIME) {
      input.placeholder = `в минутах(текущ. ${Timer.__defaultLongBreakTime})`;

      confirmChangingBtn.addEventListener('click', () => {
        Timer.__defaultLongBreakTime = Number(input.value.replace(/[^0-9]/g,''));
        Timer.setBreakTimeByDefault();
        localStorage.setItem('settings-default-long-break-time', Timer.__defaultLongBreakTime.toString());
      });
    } else if (wrapperParam === SETTINGS_WRAPPER.FREQUENCY_OF_LONG_BREAK) {
      input.placeholder = `(текущ. ${Timer.__frequencyOfLongBreak})`;

      confirmChangingBtn.addEventListener('click', () => {
        Timer.__frequencyOfLongBreak = Number(input.value.replace(/[^0-9]/g,''));
        localStorage.setItem('settings-default-frequency-of-long-break', Timer.__frequencyOfLongBreak.toString());
      });
    }

    confirmChangingBtn.addEventListener('click', () => {
      hideAll();
    });

    input.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        confirmChangingBtn.click();
      }
    });

    return wrapper;
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
    const defaultTimeFromLocalStorage: number | null = Number(localStorage.getItem('settings-default-time'));
    const defaultShortBreakTimeFromLocalStorage: number | null = Number(localStorage.getItem('settings-default-short-break-time'));
    const defaultLongBreakTimeFromLocalStorage: number | null = Number(localStorage.getItem('settings-default-long-break-time'));
    const frequencyOfLongBreakBtnFromLocalStorage: number | null = Number(localStorage.getItem('settings-default-frequency-of-long-break'));

    if (defaultTimeFromLocalStorage) Timer.__defaultTime = defaultTimeFromLocalStorage;
    if (defaultShortBreakTimeFromLocalStorage) Timer.__defaultShortBreakTime = defaultShortBreakTimeFromLocalStorage;
    if (defaultLongBreakTimeFromLocalStorage) Timer.__defaultLongBreakTime = defaultLongBreakTimeFromLocalStorage;
    if (frequencyOfLongBreakBtnFromLocalStorage) Timer.__frequencyOfLongBreak = frequencyOfLongBreakBtnFromLocalStorage;

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

    if (Timer.timeStatus === TIME_STATUS.READINESS) {
      Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
    }
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

    const tomatoPassed: number | null = Number(localStorage.getItem('tomato-passed'));
    if (tomatoPassed) {
      localStorage.setItem('tomato-passed', (tomatoPassed + 1).toString());
    } else localStorage.setItem('tomato-passed', '1');

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
    const tomatoPassed: number | null = Number(localStorage.getItem('tomato-passed'));
    if (tomatoPassed && tomatoPassed >= Timer.__frequencyOfLongBreak) {
      Timer.currentTime = Timer.__defaultLongBreakTime;
      localStorage.setItem('tomato-passed', '0');
    } else Timer.currentTime = Timer.__defaultShortBreakTime;

    if (Timer.timeStatus === TIME_STATUS.READINESS) {
      Timer.timeElement ? Timer.timeElement.textContent = Timer.getNormalTimeFormat() : '';
    }
    localStorage.setItem('current-task-time', Timer.currentTime.toString());
  }

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
