import tippy from 'tippy.js';
import { hideAll } from 'tippy.js';
import 'tippy.js/animations/shift-toward.css';

import '../../images/logo.svg';
import '../../images/statistic-link.svg';
import '../../images/task-settings.svg';

import Task, { ITaskInfo } from '../modules/task';
import { KINDS_OF_THEME, Theme } from '../modules/theme';
import { TASK_STATUS, Timer } from '../modules/timer';

document.addEventListener('DOMContentLoaded', () => {
  // changing theme

  Theme.setThemeFromLocalStorage();

  const changeThemeBtn: HTMLButtonElement | null = document.querySelector('.header__change-theme-btn');

  if (changeThemeBtn) {
    changeThemeBtn.addEventListener('click', () => {
      if (Theme.getCurrentTheme() === KINDS_OF_THEME.DARK) {
        Theme.changeTheme(KINDS_OF_THEME.LIGHT);
      } else if (Theme.getCurrentTheme() === KINDS_OF_THEME.LIGHT) {
        Theme.changeTheme(KINDS_OF_THEME.DARK);
      }
    });
  }

  // task list
  const addTaskBtn: HTMLButtonElement | null = document.querySelector('.app__task-list-add-task');
  const taskNameInput: HTMLInputElement | null = document.querySelector('.app__task-list-input');
  const taskList: HTMLUListElement | null = document.querySelector('.app__task-list');

  if(localStorage.getItem('tasks')) {
    taskList ? taskList.innerHTML = '' : '';

    const tasks: Record<string, ITaskInfo> = JSON.parse(localStorage.getItem('tasks') as string);

    Object.values(tasks).forEach((taskInfo) => {
      const task: Task = new Task(taskInfo);
      taskList?.append(task.createTaskElement());

      if (task.taskInfo.id === Timer.getCurrentTaskId()) {
        Timer.setTaskForReadiness(task.taskInfo);
      }
    });
  }

  if (addTaskBtn && taskNameInput) {
    taskNameInput.addEventListener('input', (event: Event) => {
      const inputElement = event.currentTarget as HTMLInputElement;

      if (inputElement.value !== '') {
        addTaskBtn !== null ? addTaskBtn.disabled = false : '';
      } else {
        addTaskBtn !== null ? addTaskBtn.disabled = true : '';
      }
    });

    taskNameInput.addEventListener('keypress', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        addTaskBtn?.click();
      }
    });

    addTaskBtn.addEventListener('click', () => {
      const task: Task = new Task(Task.createDefaultTaskInfo(taskNameInput.value.trim()));
      taskList?.prepend(task.createTaskElement());
      const currentTaskId: string | null = Timer.getCurrentTaskId();

      if (localStorage.getItem('current-task-status') === TASK_STATUS.ACTIVE_COMPLETE && currentTaskId) {
        Task.removeTaskById(currentTaskId);
      }
      Timer.setTaskForReadiness(task.taskInfo);

      taskNameInput.value = '';
      addTaskBtn.disabled = true;
    });
  }

  // task settings
  const taskSettingsTrigger: HTMLButtonElement | null = document.querySelector('.app__task-settings-trigger');
  const taskSettingsMenu: HTMLDivElement = document.createElement('div');

  taskSettingsMenu.classList.add('app__task-settings-menu');

  const changeTimeForTomatoBtn: HTMLButtonElement = document.createElement('button');
  const changeTimeForShortBreakBtn: HTMLButtonElement = document.createElement('button');
  const changeTimeForLongBreakBtn: HTMLButtonElement = document.createElement('button');
  const changeCountTomatoForLongBreakTriggerBtn: HTMLButtonElement = document.createElement('button');
  const switchingNoticesWrapper: HTMLDivElement = document.createElement('div');
  const switchingNoticesBtn: HTMLButtonElement = document.createElement('button');

  changeTimeForTomatoBtn.classList.add('app__task-settings-btn');
  changeTimeForShortBreakBtn.classList.add('app__task-settings-btn');
  changeTimeForLongBreakBtn.classList.add('app__task-settings-btn');
  changeCountTomatoForLongBreakTriggerBtn.classList.add('app__task-settings-btn');
  switchingNoticesWrapper.classList.add('app__task-settings-switching-notices-wrapper');
  switchingNoticesBtn.classList.add('app__task-settings-switching-notices-btn');

  changeTimeForTomatoBtn.textContent = 'сменить время помидора';
  changeTimeForShortBreakBtn.textContent = 'сменить время короткого перерыва';
  changeTimeForLongBreakBtn.textContent = 'сменить время длинного перерыва';
  changeCountTomatoForLongBreakTriggerBtn.textContent = 'сменить кол-во помидоров для триггера длинного перерыва';
  switchingNoticesWrapper.textContent = 'уведомления';

  switchingNoticesBtn.append(document.createElement('span'));
  switchingNoticesWrapper.prepend(switchingNoticesBtn);

  const changeTimeForTomatoWrapper: HTMLDivElement = document.createElement('div');
  const changeTimeForShortBreakWrapper: HTMLDivElement = document.createElement('div');
  const changeTimeForLongBreakWrapper: HTMLDivElement = document.createElement('div');
  const changeCountTomatoForLongBreakTriggerWrapper: HTMLDivElement = document.createElement('div');

  const changeTimeForTomatoInput: HTMLInputElement = document.createElement('input');
  const changeTimeForShortBreakInput: HTMLInputElement = document.createElement('input');
  const changeTimeForLongBreakInput: HTMLInputElement = document.createElement('input');
  const changeCountTomatoForLongBreakTriggerInput: HTMLInputElement = document.createElement('input');

  changeTimeForTomatoInput.textContent = 'в минутах(по умолчанию 25)';
  changeTimeForShortBreakInput.textContent = 'в минутах(по умолчанию 5)';
  changeTimeForLongBreakInput.textContent = 'в минутах(по умолчанию 15)';
  changeCountTomatoForLongBreakTriggerInput.textContent = '(по умолчанию 4)';

  const confirmChangingBtn: HTMLButtonElement = document.createElement('button');
  const confirmChangingSvg: SVGElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const confirmChangingUse: SVGUseElement = document.createElementNS('http://www.w3.org/2000/svg', 'use');

  confirmChangingUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#confirm-changing');

  confirmChangingSvg.append(confirmChangingUse);
  confirmChangingBtn.append(confirmChangingSvg);

  tippy(changeTimeForTomatoBtn, {
    content: changeTimeForTomatoInput,
    placement: 'left',
    interactive: true,
    animation: 'shift-toward',
    trigger: 'click',
    offset: [0, 15],
  });

  changeTimeForTomatoWrapper.append(changeTimeForTomatoInput);
  changeTimeForShortBreakWrapper.append(changeTimeForShortBreakInput);
  changeTimeForLongBreakWrapper.append(changeTimeForLongBreakInput);
  changeCountTomatoForLongBreakTriggerWrapper.append(changeCountTomatoForLongBreakTriggerInput);
  changeTimeForTomatoWrapper.append(confirmChangingBtn);
  changeTimeForShortBreakWrapper.append(confirmChangingBtn);
  changeTimeForLongBreakWrapper.append(confirmChangingBtn);
  changeCountTomatoForLongBreakTriggerWrapper.append(confirmChangingBtn);

  taskSettingsMenu.append(changeTimeForTomatoBtn);
  taskSettingsMenu.append(changeTimeForShortBreakBtn);
  taskSettingsMenu.append(changeTimeForLongBreakBtn);
  taskSettingsMenu.append(changeCountTomatoForLongBreakTriggerBtn);
  taskSettingsMenu.append(switchingNoticesWrapper);

  if (taskSettingsTrigger) {
    tippy(taskSettingsTrigger, {
      content: taskSettingsMenu,
      placement: 'bottom',
      interactive: true,
      animation: 'shift-toward',
      trigger: 'click',
      offset: [-123, 15],
    });
  }
});
