import { HeroService } from './../hero.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { booksFrame } from '../interface';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  error: any;
  // @ViewChild('f') SignUpForm!: NgForm;
  @ViewChild('f') f!: NgForm;
  resAPI: any;

  onSubmit() {
    // Your form submission logic goes here
    // After successful submission, reset the form
    this.routeToOverview();
  }

  constructor(
    private api: HeroService,
    private router: Router // private route: Router
  ) {}
  APIdata: any = [];
  current: Date = new Date();
  successMessage: string | null = null;
  largestOrderID?: number;
  // currentDate: Date = Date.now;
  formData: booksFrame = {
    orderID: null,
    counterNo: null,
    cashierName: '',
    orderDate: this.current,
    refund: false,
    // noRefund: undefined,
    discount: false,
    discPercentage: null,
  };
  ngOnInit() {
    console.log(!this.api.index);
    // console.log(!this.api.newbook);
    //redirect user to Overview page if user not come from overview
    if (!(this.api.index + 1) && !this.api.newbook) {
      return this.routeToOverview();
    } else if (this.api.newbook) {
      this.createNewBook();
    } else {
      this.APIcall();
    }
  }

  ngOnDestroy() {
    if (this.api.movieSubscription) {
      this.api.movieSubscription.unsubscribe();
    }
  }

  test(data: any) {
    console.log(data);
  }
  APItest(data: any) {
    console.log('in API Test ... ');
  }
  async APIcall() {
    await this.api.read().subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        res.books.sort((a: any, b: any) => a.orderID - b.orderID);
        this.api.data = res;
        this.displayOne();
      },
      error: (err: any) => {
        this.error = err.error.errors;
        console.log(err.message);
      },
    });
  }
  // method + or - or empty
  async displayOne(method?: string) {
    console.log('display One...');
    const getOne = this.api.data.books;
    this.formData.orderID = getOne[this.api.index]['orderID'];
    console.log(this.formData.orderID);
    this.formData.counterNo = getOne[this.api.index]['counterNo'];
    this.formData.cashierName = getOne[this.api.index]['cashierName'];

    let converDate = getOne[this.api.index]['orderDate'];
    console.log(typeof converDate);
    this.formData.orderDate = converDate.slice(0, 10);
    this.formData.refund = getOne[this.api.index]['refund'];

    this.formData.discount = getOne[this.api.index]['discount'];
    this.formData.discPercentage = getOne[this.api.index]['discPercentage'];
  }
  async saveData() {
    if (this.api.newbook) {
      await this.createNew(this.formData);
      this.successMessage = 'Book successfully created!';
      this.clearInput();
    } else {
      this.api.movieSubscription = await this.api
        .update(this.formData, this.formData.orderID)
        .subscribe({
          next: (res: any) => {
            console.log(res, 'response');
            this.successMessage = 'Book successfully updated!';

            this.router.navigateByUrl('overview');
          },
          error: (err: any) => {
            this.error = err.error.errors;
            console.log(err.message);
          },
        });
    }
    //call clear message after 3 second
    this.clearSuccessMessage();
  }

  //clear message function
  clearSuccessMessage() {
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  async deleteData() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this data?'
    );

    if (confirmed) {
      this.api.movieSubscription = await this.api
        .delete(this.formData.orderID)
        .subscribe({
          next: (res: any) => {
            console.log(res, 'response');
            this.api.data.books.splice(this.api.index, 1);
            console.log(this.api.data.books);
            if (this.api.index === 0) {
              this.api.index++;
            }
            this.successMessage = 'Book successfully deleted!';
            //call clear message after 3 second
            this.clearSuccessMessage();
            // this.APIdata.results = this.APIdata.results - 1;
            console.log(this.api.index);
            this.displayOne('-');
          },
          error: (err: any) => {
            this.error = err.error.errors;
            console.log(err.message);
          },
        });
      // await this.api.deleteAPI(this.formData.orderID);
    } else {
      console.log('Deletion canceled.');
    }
  }

  refundOn(value: boolean) {
    return (this.formData.refund = value);
  }

  routeToOverview() {
    this.router.navigateByUrl('overview');
    this.api.clearData();
    // form.resetForm();
  }

  createNewBook() {
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
    this.largestOrderID = objectWithLargestOrderID.orderID + 1;
    this.formData.orderID = objectWithLargestOrderID.orderID + 1;
    let currentDate: any = new Date();
    let formattedDate: any = currentDate.toISOString().slice(0, 19) + '.000Z';
    this.formData.orderDate = formattedDate.slice(0, 10);
  }
  async createNew(form: booksFrame) {
    this.api.movieSubscription = await this.api.create(form).subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        // console.log(this.formData);
        this.resAPI = res;
        this.formData.orderID = this.resAPI.books.orderID + 1;
      },
      error: (err: any) => {
        this.error = err.error.errors;
        console.log(err.message);
      },
    });
  }
  getCurrentDate() {}
  onDiscountChange() {
    if (this.formData.discount === false) {
      // Reset discPercentage when discount is not checked
      this.formData.discPercentage = null;
    }
  }
  clearInput() {
    console.log('before clear ');
    console.log(this.largestOrderID);

    // this.f.resetForm();
    this.f.controls['counterNo'].reset();
    this.f.controls['cashierName'].reset();
    this.f.controls['orderDate'].reset();
    this.f.controls['refund'].reset();
    this.f.controls['discount'].reset();
    //reset data only if discPercentage is present
    if (this.f.controls['discPercentage']) {
      this.f.controls['discPercentage'].reset();
    }
    console.log('after clear');
    // console.log(this.largestOrderID);
    // this.formData.counterNo = this.largestOrderID;
    // this.formData.orderID = this.largestOrderID;
    // console.log(this.formData.orderID)
  }
}
