import { ITaskInfo } from './task';
import timeEndSound from '../../audio/time-end-sound.mp3';

export class Timer {
  private static timeElement: HTMLSpanElement | null = document.querySelector('.app__task-time');
  private static time: number;
  private static TimeInterval: NodeJS.Timeout;
  private static timeEndSound: HTMLAudioElement = document.createElement('audio');

  // info

  static getCurrentTaskId(): string | null {
    const id: string | null = localStorage.getItem('current-task-id');
    return id;
  }

  // readiness

  static setTaskForReadiness(task: ITaskInfo): void {
    Timer.setDefaultTime(1);

    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
    const taskInfoIntroduction: HTMLSpanElement | null = document.querySelector('.app__task-info span');
    const taskInfoName: HTMLSpanElement | null = document.querySelector('.app__task-info-name');

    title ? title.textContent = task.name : '';
    currentTomato ? currentTomato.textContent = `Помидор: ${task.tomatoCount}` : '';
    taskInfoIntroduction ? taskInfoIntroduction.textContent = 'Задача 1 - ' : '';
    taskInfoName ? taskInfoName.textContent = task.name : '';

    const firstBtn: HTMLButtonElement | null = document.querySelector('.app__task-first-btn');
    const secondBtn: HTMLButtonElement | null = document.querySelector('.app__task-second-btn');
    const addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

    firstBtn ? firstBtn.disabled = false : '';
    addTimeBtn ? addTimeBtn.disabled = false : '';

    firstBtn?.addEventListener('click', () => {
      Timer.start();
      secondBtn ? secondBtn.disabled = false : '';
    });

    localStorage.setItem('current-task-id', task.id);
  }

  static clearReadiness(): void {
    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
    const taskInfoIntroduction: HTMLSpanElement | null = document.querySelector('.app__task-info span');
    const taskInfoName: HTMLSpanElement | null = document.querySelector('.app__task-info-name');

    title ? title.textContent = 'Добавьте или выберите задачу' : '';
    currentTomato ? currentTomato.textContent = '' : '';
    taskInfoIntroduction ? taskInfoIntroduction.textContent = '' : '';
    taskInfoName ? taskInfoName.textContent = '' : '';

    const firstBtn: HTMLButtonElement | null = document.querySelector('.app__task-first-btn');
    const secondBtn: HTMLButtonElement | null = document.querySelector('.app__task-second-btn');
    const addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

    firstBtn ? firstBtn.disabled = true : '';
    secondBtn ? secondBtn.disabled = true : '';
    addTimeBtn ? addTimeBtn.disabled = true : '';

    localStorage.removeItem('current-task-id');
  }

  // time

  private static setDefaultTime(minutes: number): void {
    Timer.time = minutes * 60;
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

      return `${minutes}:${seconds}`;
    } else {
      seconds = time;
      return seconds.toString();
    }
  }

  private static start(): void {
    if (Timer.timeElement) {
      Timer.time -= 1;
      Timer.timeElement.textContent = Timer.getNormalTimeFormat();
    }
    Timer.TimeInterval = setInterval(() => {
      if (Timer.time <= 1) {
        clearInterval(Timer.TimeInterval);
        Timer.playTimeEndSound();
      }
      if (Timer.timeElement) {
        Timer.time -= 1;
        Timer.timeElement.textContent = Timer.getNormalTimeFormat();
      }
    }, 1000);
  }

  // audio

  private static playTimeEndSound(): void {
    Timer.timeEndSound.src = timeEndSound;
    Timer.timeEndSound.loop = true;
    document.body.append(Timer.timeEndSound);
    Timer.timeEndSound.play();
  }
}
