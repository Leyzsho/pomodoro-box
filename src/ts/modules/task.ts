import tippy from 'tippy.js';
import { hideAll } from 'tippy.js';
import 'tippy.js/animations/shift-toward.css';

import { v4 as uuidv4 } from 'uuid';

import '../../images/configuration-add-tomato.svg';
import '../../images/configuration-remove-tomato.svg';
import '../../images/configuration-edit.svg';
import '../../images/configuration-remove-task.svg';
import '../../images/configuration-confirm-name-changing.svg';

import { TIME_STATUS, Timer } from './timer';
import { TASK_STATUS } from './timer';
import gsap from 'gsap';
export interface ITaskInfo {
  name: string;
  tomatoCount: number;
  id: string;
}

export default class Task {
  // element methods

  private tomatoCountElement: HTMLSpanElement | null = null;
  private nameElement: HTMLSpanElement | null = null;
  private taskWrapper: HTMLLIElement | null = null;

  constructor(public readonly taskInfo: ITaskInfo) {}

  // task info methods

  static createDefaultTaskInfo(name: string): ITaskInfo {
    return {
      name,
      tomatoCount: 1,
      id: uuidv4(),
    };
  }

  // full time methods

  private static getFullTasksTime(): string | null {
    if (localStorage.getItem('tasks')) {
      const tasks: Record<string, ITaskInfo> = JSON.parse(localStorage.getItem('tasks') as string);
      let minutes: number = Object.values(tasks).reduce((acc, task) => acc + task.tomatoCount * 25, 0);
      let hours: number = 0;
      while (minutes > 59) {
        hours += 1;
        minutes -= 60;
      }

      if (hours > 0) {
        return `${hours} ч. ${minutes} мин.`;
      } else return `${minutes} мин.`;
    } else return null;
  }

  private static updateFullTimeElement(): void {
    const fullTime: HTMLSpanElement | null = document.querySelector('.app__task-list-full-time');
    if (this.getFullTasksTime() !== null) {
      fullTime ? fullTime.textContent = this.getFullTasksTime() : '';
    } else fullTime ? fullTime.textContent = '' : '';
  }

  // local storage methods

  public saveTaskInLocalStorage(): void {
    const tasks: Record<string, ITaskInfo> = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks') as string) : {};
    tasks[this.taskInfo.id] = this.taskInfo;

    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  private removeTaskInLocalStorage(): void {
    localStorage.removeItem('current-task-status');
    localStorage.removeItem('current-task-time');
    localStorage.removeItem('current-task-tomato');

    const tasks: Record<string, ITaskInfo> = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks') as string) : {};

    delete tasks[this.taskInfo.id];

    if (this.taskInfo.id === Timer.getCurrentTaskId()) {
      if (Object.values(tasks)[0]) {
        Timer.setTaskForReadiness(Object.values(tasks)[0]);
      } else {
        Timer.clearReadiness();
      }
    }

    if (Object.values(tasks)[0]) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } else localStorage.removeItem('tasks');
  }

  private static removeTaskInLocalStorageById(id: string): void {
    localStorage.removeItem('current-task-status');
    localStorage.removeItem('current-task-time');
    localStorage.removeItem('current-task-tomato');

    const tasks: Record<string, ITaskInfo> = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks') as string) : {};

    delete tasks[id];

    if (id === Timer.getCurrentTaskId()) {
      if (Object.values(tasks)[0]) {
        Timer.setTaskForReadiness(Object.values(tasks)[0]);
      } else {
        Timer.clearReadiness();
      }
    }

    if (Object.values(tasks)[0]) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } else localStorage.removeItem('tasks');
  }

  // task element methods

  public createTaskElement(): HTMLLIElement {
    this.taskWrapper = document.createElement('li');
    const configuration: HTMLButtonElement = document.createElement('button');
    const configurationMenu: HTMLDivElement = this.createConfigurationMenu();

    this.tomatoCountElement = document.createElement('span');
    this.nameElement = document.createElement('span');

    this.taskWrapper.classList.add('app__task-list-item');
    this.tomatoCountElement.classList.add('app__task-list-tomato-count');
    this.nameElement.classList.add('app__task-list-name');
    configuration.classList.add('app__task-list-open-configuration');

    this.taskWrapper.setAttribute('data-id', this.taskInfo.id);
    this.nameElement.textContent = this.taskInfo.name;
    this.tomatoCountElement.textContent = this.taskInfo.tomatoCount.toString();

    this.taskWrapper.setAttribute('tabindex', '0');

    this.taskWrapper.addEventListener('click', (event) => {
      const currentTaskId = Timer.getCurrentTaskId();

      if (localStorage.getItem('current-task-status') === TASK_STATUS.ACTIVE_COMPLETE && currentTaskId !== null) {
        Task.removeTaskById(currentTaskId);
      }

      if (event.target === this.taskWrapper || event.target === this.tomatoCountElement || event.target === this.nameElement) {
        Timer.setTaskForReadiness(this.taskInfo);
      }
    });

    this.taskWrapper.addEventListener('keypress', (event: KeyboardEvent) => {
      const currentTaskId = Timer.getCurrentTaskId();

      if (localStorage.getItem('current-task-status') === TASK_STATUS.ACTIVE_COMPLETE && currentTaskId !== null) {
        Task.removeTaskById(currentTaskId);
      }

      if (event.key === 'Enter') {
        Timer.setTaskForReadiness(this.taskInfo);
      }
    });

    tippy(configuration, {
      content: configurationMenu,
      placement: 'bottom',
      interactive: true,
      animation: 'shift-toward',
      trigger: 'mouseenter click',
      offset: [0, 15],
    });

    configuration.append(document.createElement('span'));
    configuration.append(document.createElement('span'));
    configuration.append(document.createElement('span'));

    this.taskWrapper.append(this.tomatoCountElement);
    this.taskWrapper.append(this.nameElement);
    this.taskWrapper.append(configuration);

    this.saveTaskInLocalStorage();
    Task.updateFullTimeElement();

    return this.taskWrapper;
  }

  private updateTaskElement(): void {
    Task.updateFullTimeElement();

    if (this.tomatoCountElement) {
      this.tomatoCountElement.textContent = this.taskInfo.tomatoCount.toString();
    }

    if (this.nameElement) {
      this.nameElement.textContent = this.taskInfo.name;
    }

    if (this.taskInfo.id === Timer.getCurrentTaskId()) {
      Timer.updateTaskInfo(this.taskInfo);
    }
  }

  public static updateTomatoCountById(id: string): void {
    const tasks: Record<string, ITaskInfo> = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks') as string) : {};
    const task: ITaskInfo = tasks[id];
    task.tomatoCount -= 1;
    tasks[id] = task;

    localStorage.setItem('tasks', JSON.stringify(tasks));

    Task.updateFullTimeElement();

    const taskELement: HTMLLIElement | null = document.querySelector(`.app__task-list-item[data-id="${id}"]`);
    const tomatoCountElement: HTMLSpanElement | null = taskELement ? taskELement.querySelector('.app__task-list-tomato-count') : null;
    tomatoCountElement ? tomatoCountElement.textContent = task.tomatoCount.toString() : '';
  }

  // configuration element methods

  private createConfigurationMenu(): HTMLDivElement {
    const menuWrapper: HTMLDivElement = document.createElement('div');

    const addTomatoBtn: HTMLButtonElement = document.createElement('button');
    const removeTomatoBtn: HTMLButtonElement = document.createElement('button');
    const editNameBtn: HTMLButtonElement = document.createElement('button');
    const removeTaskBtn: HTMLButtonElement = document.createElement('button');

    menuWrapper.classList.add('app__task-list-configuration-menu');
    addTomatoBtn.classList.add('app__task-list-configuration-add-tomato');
    removeTomatoBtn.classList.add('app__task-list-configuration-remove-tomato');
    editNameBtn.classList.add('app__task-list-configuration-edit');
    removeTaskBtn.classList.add('app__task-list-configuration-remove-task');

    addTomatoBtn.textContent = 'Увеличить';
    removeTomatoBtn.textContent = 'Уменьшить';
    editNameBtn.textContent = 'Редактировать';
    removeTaskBtn.textContent = 'Удалить';

    if (this.taskInfo.tomatoCount + 1 === 10) {
      addTomatoBtn.disabled = true;
    }

    if (this.taskInfo.tomatoCount - 1 === 0) {
      removeTomatoBtn.disabled = true;
    }

    const addTomatoSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const removeTomatoSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const editSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const removeTaskSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const addTomatoUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const removeTomatoUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const editUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    const removeTaskUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    addTomatoUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#configuration-add-tomato');
    removeTomatoUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#configuration-remove-tomato');
    editUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#configuration-edit');
    removeTaskUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#configuration-remove-task');

    addTomatoSvg.append(addTomatoUse);
    removeTomatoSvg.append(removeTomatoUse);
    editSvg.append(editUse);
    removeTaskSvg.append(removeTaskUse);

    addTomatoBtn.prepend(addTomatoSvg);
    removeTomatoBtn.prepend(removeTomatoSvg);
    editNameBtn.prepend(editSvg);
    removeTaskBtn.prepend(removeTaskSvg);

    const editNameWrapper: HTMLDivElement = document.createElement('div');
    const editNameInput: HTMLInputElement = document.createElement('input');
    const confirmNameChangingBtn: HTMLButtonElement = document.createElement('button');
    const confirmNameChangingSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const confirmNameChangingUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');

    confirmNameChangingUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#configuration-confirm-name-changing');

    editNameWrapper.classList.add('app__task-list-configuration-name-changing-wrapper');
    editNameInput.classList.add('app__task-list-configuration-name-changing-input');
    confirmNameChangingBtn.classList.add('app__task-list-configuration-name-changing-btn');

    gsap.set(editNameInput, { height: editNameBtn.offsetHeight });

    editNameInput.placeholder = 'название задачи';

    confirmNameChangingSvg.append(confirmNameChangingUse);
    confirmNameChangingBtn.append(confirmNameChangingSvg);
    editNameWrapper.append(editNameInput);
    editNameWrapper.append(confirmNameChangingBtn);

    tippy(editNameBtn, {
      content: editNameWrapper,
      placement: 'right',
      interactive: true,
      animation: 'shift-toward',
      trigger: 'click',
      offset: [0, 15],
    });

    addTomatoBtn.addEventListener('click', () => {
      removeTomatoBtn.disabled = false;

      if (this.tomatoCountElement) {
        this.taskInfo.tomatoCount < 9 ? this.addTomato() : addTomatoBtn.disabled = true;

        if (this.taskInfo.tomatoCount + 1 === 10) {
          addTomatoBtn.disabled = true;
        }
      }
    });

    removeTomatoBtn.addEventListener('click', () => {
      addTomatoBtn.disabled = false;

      if (this.tomatoCountElement) {
        this.taskInfo.tomatoCount > 1 ? this.removeTomato() : removeTomatoBtn.disabled = true;

        if (this.taskInfo.tomatoCount - 1 === 0) {
          removeTomatoBtn.disabled = true;
        }
      }
    });

    editNameInput.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        confirmNameChangingBtn.click();
      }
    });

    removeTaskBtn.addEventListener('click', () => {
      this.removeTask();
    });

    confirmNameChangingBtn.addEventListener('click', () => {
      hideAll();
      this.editName(editNameInput.value.trim());
    });

    menuWrapper.append(addTomatoBtn);
    menuWrapper.append(removeTomatoBtn);
    menuWrapper.append(editNameBtn);
    menuWrapper.append(removeTaskBtn);

    return menuWrapper;
  }

  private addTomato(): void {
    this.taskInfo.tomatoCount += 1;
    this.saveTaskInLocalStorage();
    this.updateTaskElement();
  }

  private removeTomato(): void {
    this.taskInfo.tomatoCount -= 1;
    this.saveTaskInLocalStorage();
    this.updateTaskElement();
  }

  private editName(name: string): void {
    this.taskInfo.name = name;
    this.saveTaskInLocalStorage();
    this.updateTaskElement();
  }

  private removeTask(): void {
    Timer.timeStatus = TIME_STATUS.READINESS;
    this.taskWrapper?.remove();
    this.removeTaskInLocalStorage();
    Task.updateFullTimeElement();
  }

  public static removeTaskById(id: string): void {
    document.querySelector(`.app__task-list-item[data-id="${id}"]`)?.remove();
    Task.removeTaskInLocalStorageById(id);
    Task.updateFullTimeElement();
  }
}
