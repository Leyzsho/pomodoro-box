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

    const currentTask: ITaskInfo = JSON.parse(localStorage.getItem('current-task') as string);
    Timer.setTaskForReadiness(currentTask);

    const tasks: ITaskInfo[] = JSON.parse(localStorage.getItem('tasks') as string);

    tasks.forEach((taskInfo) => {
      const task: Task = new Task(taskInfo);

      taskList?.append(task.createTaskElement());
    });
  }

  if (addTaskBtn && taskNameInput) {
    const taskInfo: ITaskInfo = {
      name: '',
      tomatoCount: 1,
    };

    taskNameInput.addEventListener('input', (event: Event) => {
      const inputElement = event.currentTarget as HTMLInputElement;

      if (inputElement.value !== '') {
        addTaskBtn !== null ? addTaskBtn.disabled = false : '';
        taskInfo.name = inputElement.value.trim();
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

      const task: Task = new Task(taskInfo);

      taskList?.append(task.createTaskElement());

      Task.saveTaskInLocalStorage(task.getInfoAboutTask());

      Timer.setTaskForReadiness(task.getInfoAboutTask());

      taskNameInput.value = '';
      addTaskBtn.disabled = true;
    });
  }

  // task
});
