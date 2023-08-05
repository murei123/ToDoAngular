import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';
import {TodoFilterType} from './todo-filter-type';
import {TodoItem} from './todo-item/todo-item';
import {TodoService} from './todo.service';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  public todoCategories: String[];
  public selectedFilterType: string;
  public newTodo: TodoItem = new TodoItem(0, '', '', null, false);
  public filterValue: string;

  public readonly filterTypes: TodoFilterType[] = [
    { name: 'По умолчанию', isHidden: true }, { name: 'Название', }, { name: 'Описание', }, { name: 'Категория', }];

  public openAddEditModal: Subject<TodoItem> = new Subject();

  public get todos(): Readonly<TodoItem[]> {
    return this._todoList;
  }

  private _todoList: TodoItem[] = [];
  private _filterSubject: BehaviorSubject<string> = new BehaviorSubject('');
  private readonly _filterDelayTime: number = 500;

  private _filterBSDestroyed$: Subject<string> = new Subject();
  private _getTodoListDestroyed$: Subject<TodoItem[]> = new Subject();
  private _deleteTodoItemDestroyed$: Subject<any> = new Subject();
  private _addTodoItemDestroyed$: Subject<TodoItem> = new Subject();
  private _editTodoItemDestroyed$: Subject<TodoItem> = new Subject();

  constructor(private todoService: TodoService) { }


  public ngOnInit(): void {
    this.selectedFilterType = this.filterTypes[0].name;
    this.getTodoList();

    this._filterSubject.pipe(
      debounceTime(this._filterDelayTime),
      takeUntil(this._filterBSDestroyed$),
    ).subscribe(searchTextValue => {
      this._handleSearch(searchTextValue);
    });
  }

  public ngOnDestroy(): void {
    this._filterBSDestroyed$.complete();
    this._getTodoListDestroyed$.complete();
    this._addTodoItemDestroyed$.complete();
    this._editTodoItemDestroyed$.complete();
    this._deleteTodoItemDestroyed$.complete();
  }

  public getTodoList(): void {
    this.todoService.getTodoList()
      .pipe(takeUntil(this._getTodoListDestroyed$))
      .subscribe(todos => {
        this._todoList = todos;
        this.todoCategories = ["Работа ", "Дом"];
      });
  }

  public isCategorySelected(todoCategory: string): boolean {
    return todoCategory && todoCategory === this.newTodo.category;
  }

  public chooseFilterType(name: string): void {
    this.filterTypes.forEach((ft: TodoFilterType) => {
      ft.isHidden = ft.name === name;
    });

    this.selectedFilterType = name;
    this._handleSearch(this._filterSubject.value);
  }

  public filterTodo($event: any): void {
    let searchValue = $event.target.value.toLocaleLowerCase();
    this._filterSubject.next(searchValue);
  }

  public resetFilter(): void {
    this.filterValue = '';
    this.filterTodo({ target: { value: this.filterValue } });
  }

  public openAddModal(): void {
    this.newTodo.label = this.newTodo.description = '';
    this.newTodo.category = null;
    this.openAddEditModal.next(this.newTodo);
  }

  public deleteTodoItem(todoId: number): void {
    this.todoService
      .deleteTodoItem(todoId)
      .pipe(takeUntil(this._deleteTodoItemDestroyed$))
      .subscribe(() => {
        const index = this._todoList.findIndex(t => t.id === todoId);

        if (index !== -1) {
          this._todoList.splice(index, 1);
        }
      });
  }

  public addTodoItem(todoItem: TodoItem): void {
    let todoNewId = 0;
    if(this._todoList.length === 0){
      todoNewId =1;
    } else {
      todoNewId = Math.max(...this._todoList.map(o => o.id)) + 1;
    }
    todoItem.id = todoNewId;

    this.todoService.addTodoItem(todoItem)
      .pipe(takeUntil(this._addTodoItemDestroyed$))
      .subscribe(() => {
        this._todoList.push(new TodoItem(
          todoNewId,
          todoItem.label,
          todoItem.description,
          todoItem.category,
          todoItem.isCompleted,
          todoItem.completedOn));
      });
  }

  public editTodoItem(todoItem: TodoItem): void {
    this.todoService.editTodoItem(todoItem)
      .pipe(takeUntil(this._editTodoItemDestroyed$))
      .subscribe(() => {
        let updatedTodoItem = this._todoList.find(t => t.id === todoItem.id);

        if (updatedTodoItem) {
          updatedTodoItem.category = todoItem.category;
          updatedTodoItem.description = todoItem.description;
          updatedTodoItem.label = todoItem.label;
          updatedTodoItem.isCompleted = todoItem.isCompleted;
          updatedTodoItem.completedOn = todoItem.completedOn;
        }
      });
  }

  private _handleSearch(searchValue: string): void {
    let searchType = this.selectedFilterType != this.filterTypes[0].name
      ? this.selectedFilterType
      : this.filterTypes[1].name;

    searchType = this.toSearchType(searchType);

    this._todoList.forEach((l: TodoItem) => {
      l.isHidden = l[searchType].toLocaleLowerCase().indexOf(searchValue) === -1;
    });
  }

  private toSearchType(searchType: string){
    if(searchType === "Название"){
      return "label";
    }else if(searchType === "Описание"){
      return "description"
    }else if(searchType === "Категория"){
      return "category"
    }
  }
}
