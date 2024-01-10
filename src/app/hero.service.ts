import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  data: any;
  APIres: any;
  newbook: boolean | undefined;
  index: any ;
  movieSubscription: any;
  constructor(private http: HttpClient) {
  }
  sayHello() {
    alert('Hello');
  }

  clearData() {
    this.data = [];
    this.APIres = [];
    this.newbook = undefined;
    this.index = undefined;

  }

  read() {
    return this.http.get(`http://localhost:4000/api/v1/books/listsF?`);
  }
  create(body: any){
    return this.http.post(`http://localhost:4000/api/v1/books/save`, body);
  }
  createBulk(body: any){
    return this.http.post(`http://localhost:4000/api/v1/books/import`, body);
  }
  update(body: any, orderID: any){
    return this.http.patch(`http://localhost:4000/api/v1/books/update/${orderID}`, body);
  }
  delete(orderID: any){
    return this.http.delete(`http://localhost:4000/api/v1/books/delete/${orderID}`);
  }
}
