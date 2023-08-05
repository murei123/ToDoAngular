import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { TodoItem } from './todo-item';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.scss']
})
export class TodoItemComponent implements OnInit {
  @Input()    todoItem: TodoItem;
  @Input() todoCategories: string[];
  @Output() deleteTodoItem: EventEmitter<number> = new EventEmitter();
  @Output() editTodoItem: EventEmitter<TodoItem> = new EventEmitter();

  public editSelectedTodo: TodoItem;
  public openAddEditModal: Subject<TodoItem> = new Subject();

  constructor(private _modalService: NgbModal) { }

  public ngOnInit(): void {
  }

  public isCategorySelected(todoCategory: string): boolean {
    return todoCategory && todoCategory === this.editSelectedTodo.category;
  }

  public openDeleteTodoModal(content: any, todoId: number): void {
    this._modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result.then(
        () => this.deleteTodoItem.next(todoId)
      );
  }

  public openCompleteTodoModal(content: any, todoItem: TodoItem): void {
    this._modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result
      .then(
        () => {
          let updatedTodoItem = JSON.parse(JSON.stringify(todoItem));

          updatedTodoItem.completedOn = new Date();
          updatedTodoItem.isCompleted = true;

          this.editTodoItem.next(updatedTodoItem);
        }
      );
  }

  public openResetCompleteTodoModal(content: any, todoItem: TodoItem): void {
    this._modalService
      .open(content, { ariaLabelledBy: 'modal-basic-title' })
      .result
      .then(
        () => {
          let updatedTodoItem = JSON.parse(JSON.stringify(todoItem));

          updatedTodoItem.completedOn = null;
          updatedTodoItem.isCompleted = false;

          this.editTodoItem.next(updatedTodoItem);
        }
      );
  }

  public openEditTodoModal(todoItem: TodoItem): void {
    this.editSelectedTodo = JSON.parse(JSON.stringify(todoItem));
    this.openAddEditModal.next(this.editSelectedTodo);
  }
}
