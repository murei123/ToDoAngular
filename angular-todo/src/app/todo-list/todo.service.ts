import { Injectable } from "@angular/core";
import { TodoItem } from "./todo-item/todo-item";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  constructor() {
  }


  public getTodoList(): Observable<TodoItem[]> {

    var values: TodoItem[] = [],
      keys = Object.keys(localStorage),
      i = keys.length;

    while ( i-- ) {
      values.push( JSON.parse(localStorage.getItem(keys[i])));
    }

    return new Observable<TodoItem[]>(subscriber => subscriber.next(values));
  }

  public addTodoItem(todoItem: TodoItem): Observable<TodoItem> {
    localStorage.setItem(todoItem.id.toString(), JSON.stringify(todoItem));
    return new Observable<TodoItem>(subscriber => subscriber.next(todoItem));
  }

  public editTodoItem(todoItem: TodoItem): Observable<TodoItem> {
    localStorage.setItem(todoItem.id.toString(), JSON.stringify(todoItem));
    return new Observable<TodoItem>(subscriber => subscriber.next(todoItem));
  }

  public deleteTodoItem(todoId: number): any {
    localStorage.removeItem(todoId.toString())
    return new Observable<number>(subscriber => subscriber.next(todoId));
  }
}
