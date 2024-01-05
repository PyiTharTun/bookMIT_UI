import { booksFrame } from './../interface';
import { Component, OnInit } from '@angular/core';
import { HeroService } from '../hero.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-add-book',
  templateUrl: './add-book.component.html',
  styleUrls: ['./add-book.component.css'],
})
export class AddBookComponent implements OnInit {
  constructor(
    private api: HeroService,
    private http: HttpClient // private route: Router
  ) {}
  async ngOnInit() {
    console.log('add Book init');
  }
  current: Date = new Date();
  formData: booksFrame = {
    orderID: 1,
    counterNo: 1,
    cashierName: 'Cashier Name',
    orderDate: this.current,
    refund: false,
    // noRefund: true,
    discount: false,
    discPercentage: 0,
  };
  myAPI() {
    var myAPI = this.api.data.books;
    console.log('In My API ...');
    // console.log(myAPI)
    const objectWithLargestOrderID = myAPI.reduce(
      (maxOrderIDObj: { orderID: number }, obj: { orderID: number }) => {
        return obj.orderID > maxOrderIDObj.orderID ? obj : maxOrderIDObj;
      },
      {
        orderID: -1,
        counterNo: null,
        cashierName: null,
        orderDate: '',
        refund: false,
      }

    );

    console.log(objectWithLargestOrderID.orderID);
    this.formData.orderID = objectWithLargestOrderID.orderID+1;
    console.log(this.formData.orderDate);
  }

  test(){
    console.log("Hehehe");

  }
  refundOn(value: boolean) {
    if (value == true) {
      this.formData.refund = true;
    } else {
      this.formData.refund = false;
    }
    console.log(this.formData.refund);
  }

}
