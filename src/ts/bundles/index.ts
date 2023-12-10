import '../../images/logo.svg';
import '../../images/statistic-link.svg';
import Task, { ITaskInfo } from '../modules/task';
import { KINDS_OF_THEME, Theme } from '../modules/theme';
import { Timer } from '../modules/timer';

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

      if (task.taskInfo.id === Timer.getCurrentTaskId()) {
        Timer.setTaskForReadiness(task.taskInfo);
      }

      taskList?.append(task.createTaskElement());
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

      Timer.setTaskForReadiness(task.taskInfo);

      taskNameInput.value = '';
      addTaskBtn.disabled = true;
    });
  }
});
