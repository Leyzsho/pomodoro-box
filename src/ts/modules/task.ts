export interface ITaskInfo {
  name: string;
  tomatoCount: number;
}

export default class Task {
  constructor(private taskInfo: ITaskInfo) {}

  public createTaskElement(): HTMLLIElement {
    const li: HTMLLIElement = document.createElement('li');
    const tomatoCount: HTMLSpanElement = document.createElement('span');
    const name: HTMLSpanElement = document.createElement('span');
    const configuration: HTMLButtonElement = document.createElement('button');

    li.classList.add('app__task-list-item');
    tomatoCount.classList.add('app__task-list-tomato-count');
    name.classList.add('app__task-list-name');
    configuration.classList.add('app__task-list-configuration');

    name.textContent = this.taskInfo.name;
    tomatoCount.textContent = this.taskInfo.tomatoCount.toString();

    configuration.append(document.createElement('span'));
    configuration.append(document.createElement('span'));
    configuration.append(document.createElement('span'));

    li.append(tomatoCount);
    li.append(name);
    li.append(configuration);

    return li;
  }

  public getInfoAboutTask(): ITaskInfo {
    return {
      name: this.taskInfo.name,
      tomatoCount: this.taskInfo.tomatoCount,
    };
  }

  static saveTaskInLocalStorage(task: ITaskInfo): void {
    const tasks: ITaskInfo[] = localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks') as string) : [];

    tasks.push(task);

    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}
