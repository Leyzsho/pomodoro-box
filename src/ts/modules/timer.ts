import { ITaskInfo } from './task';

export class Timer {

  static getCurrentTaskId(): string | null {
    const id: string | null = localStorage.getItem('current-task-id');
    return id;
  }

  static setTaskForReadiness(task: ITaskInfo) {
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
    secondBtn ? secondBtn.disabled = false : '';
    addTimeBtn ? addTimeBtn.disabled = false : '';

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
}
