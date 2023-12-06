import { ITaskInfo } from './task';

export class Timer {
  static setTaskForReadiness(task: ITaskInfo) {
    const title: HTMLTitleElement | null = document.querySelector('.app__task-title');
    const currentTomato: HTMLSpanElement | null = document.querySelector('.app__task-current-tomato');
    const taskInfoIntroduction: HTMLSpanElement | null = document.querySelector('.app__task-info span');
    const taskInfoName: HTMLSpanElement | null = document.querySelector('.app__task-info-name');

    title ? title.textContent = task.name : '';
    currentTomato ? currentTomato.textContent = 'Помидор: 1' : '';
    taskInfoIntroduction ? taskInfoIntroduction.textContent = 'Задача 1 - ' : '';
    taskInfoName ? taskInfoName.textContent = task.name : '';

    const firstBtn: HTMLButtonElement | null = document.querySelector('.app__task-first-btn');
    const secondBtn: HTMLButtonElement | null = document.querySelector('.app__task-second-btn');
    const addTimeBtn: HTMLButtonElement | null = document.querySelector('.app__task-add-time');

    firstBtn ? firstBtn.disabled = false : '';
    secondBtn ? secondBtn.disabled = false : '';
    addTimeBtn ? addTimeBtn.disabled = false : '';

    localStorage.setItem('current-task', JSON.stringify(task));
  }
}
