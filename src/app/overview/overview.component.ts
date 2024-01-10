/// <reference types="bootstrap" />
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HeroService } from '../hero.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import * as bootstrap from 'bootstrap';
import { retry } from 'rxjs';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', './print-styles.css'],
})
export class OverviewComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  error: any;
  constructor(
    private api: HeroService,
    private http: HttpClient, // private route: Router
    private router: Router
  ) {}
  successMessage: string | null = null;
  pagedItems: any[] = [];
  pageSize = 10; // Number of items per page
  currentPage = 1; // Current page
  searchText?: any;
  APIdata: any = [];

  colList: any = [
    'Order Id',
    'Counter No',
    'Cashier Name',
    'Order Date',
    'Refund',
    'Discount',
    ' % ',
  ];
  ngOnInit() {
    //  const response =  await this.api.APIcallservice2();
    //  this.APIdata = response.books
    this.getAll();
  }
  ngAfterViewInit(): void {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]'
    );
    const tooltipArray = Array.from(tooltipTriggerList);

    tooltipArray.forEach(
      (tooltipTriggerEl) =>
        new bootstrap.Tooltip(tooltipTriggerEl as HTMLElement)
    );
  }
  ngOnDestroy() {
    if (this.api.movieSubscription) {
      this.api.movieSubscription.unsubscribe();
    }
  }

  async getAll() {
    await this.api.read().subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        res.books.sort((a: any, b: any) => a.orderID - b.orderID);
        this.api.data = res;
        // this.APIdata = res.books.sort((a :any, b: any) => a.orderID - b.orderID);
        // this.APIdata = res.books
        return (this.APIdata = res.books);
      },
      error: (err: any) => {
        this.error = err.error.errors;
        console.log(err.message);
      },
    });
  }
  async createBulk(body: any) {
    await this.api.createBulk(body).subscribe({
      next: (res: any) => {
        console.log(res, 'response');
        this.successMessage = 'Books are successfully imported!';
        this.clearSuccessMessage();
        // for( let item in res.books){
        //   this.APIdata.push(item);
        // }
        this.APIdata.push(...res.books);
        console.log(this.APIdata);
      },
      error: (err: any) => {
        this.error = err.error.errors;
        console.log(err.message);
      },
    });
  }

  goToForm() {
    this.api.newbook = true;
    this.router.navigateByUrl('book');
  }
  print(item: any) {
    console.log(item);
  }
  goToEdit(item: any) {
    console.log(item);
    const list = this.api.data.books;
    // this.api.index = list.findIndex((item: { id: any; }) => item.id === item.id);
    //
    this.api.index = list.indexOf(item);
    console.log(this.api.index);
    this.router.navigateByUrl('book');
  }

  exportToExcel(dataArray: any, fileName: string) {
    const modifiedData = dataArray.map(
      (item: {
        orderID: any;
        counterNo: any;
        cashierName: any;
        orderDate: any;
        refund: any;
        discount: any;
        discPercentage: any;
      }) => ({
        orderID: item.orderID,
        counterNo: item.counterNo,
        cashierName: item.cashierName,
        orderDate: item.orderDate.slice(0, 10), // Format the date as needed
        refund: item.refund,
        discount: item.discount,
        discPercentage: item.discPercentage,
      })
    );
    console.log(modifiedData);
    let header = [
      [
        'Order ID',
        'Counter No',
        'Cashier Name',
        'Order Date',
        'Refund',
        'Discount',
        'Discount %',
      ],
    ];
    //Had to create a new workbook and then add the header
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, header);
    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(ws, modifiedData, {
      origin: 'A2',
      skipHeader: true,
    });
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  readExcel(file: File): Promise<any[] | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
        console.log(jsonData, 'in readExcel');
        resolve(jsonData);
      };

      reader.onerror = (error) => {
        console.error('Error reading Excel file:', error);
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  }

  openFileInput() {
    // Trigger a click on the hidden file input
    this.fileInput.nativeElement.click();
  }

  async onFileChange(event: any) {
    console.log('on File Change');
    const file = event.target.files[0];
    if (file) {
      try {
        console.log('Selected file:', file);
        let jsonData = await this.readExcel(file);
        const transformedData = this.transformData(jsonData!);
        console.log(transformedData, 'THis is transformedData');

        let invalidData = this.validateImportedData(transformedData!);
        if (invalidData.length !== 0) {
          console.log(invalidData, 'This is invalidData .. ');
          this.fileInput.nativeElement.value = '';
          return alert(invalidData);
        }
        console.log('before mapppingg...');
        // Map the data to match the Sequelize model
        const mappedData = transformedData?.map((item: any) => ({
          counterNo: parseInt(item.counterNo, 10) || 0,
          cashierName: item.cashierName,
          orderDate: new Date(item.orderDate),
          refund: item.refund,
          discount: item.discount,
          discPercentage: item.discPercentage
            ? parseInt(item.discPercentage, 10)
            : null,
        }));
        console.log(mappedData, 'This is mapped Data');
        this.createBulk(mappedData);
        this.fileInput.nativeElement.value = '';
      } catch (error) {
        console.error('Error processing Excel file:', error);
      }
    }
  }
  printDoc() {
    window.print();
  }

  validateImportedData(data: any[]): string[] {
    const errors: string[] = [];

    //  Check if 'cashierName' and 'counterNo' column is present and not empty
    // const keyToCheck = 'cashierName';
    for (let item of data) {
      let keyToCheckArray = [
        'counterNo',
        'cashierName',
        'orderDate',
        'refund',
        'discount',
        'discPercentage',
      ];
      const itemIndex = data.indexOf(item);
      //validate  for counterNo
      if (item.hasOwnProperty(keyToCheckArray[0])) {
        if (!item.counterNo || typeof item.counterNo !== 'string') {
          errors.push(`Invalid Counter No at row ${itemIndex + 1}`);
        } else if (!this.isValidCounterNo(item.counterNo)) {
          errors.push(
            `Invalid Counter No at row ${
              itemIndex + 1
            }: Must be number between 0 and 10`
          );
        }
      } else {
        errors.push(`Counter No is required at row ${itemIndex + 1}!`);
      }
      //validate  for cashierName
      if (item.hasOwnProperty(keyToCheckArray[1])) {
        if (!item.cashierName || typeof item.cashierName !== 'string') {
          errors.push(`Invalid Cashier Name at row ${itemIndex + 1}`);
        }
      } else {
        errors.push(`Cashier Name is required!`);
      }
      //validate for orderDate
      if (item.hasOwnProperty(keyToCheckArray[2])) {
        if (typeof item.orderDate !== 'string') {
          errors.push(`Invalid Order Date at row ${itemIndex + 1}`);
        } else if (!this.isDateFormatValid(item.orderDate)) {
          errors.push(
            `Invalid Order Date at row ${
              itemIndex + 1
            }:Please input in "'YYYY-MM-DD " format`
          );
        }
      }
      //validate for refund
      if (item.hasOwnProperty(keyToCheckArray[3])) {
        if (typeof item.refund !== 'string') {
          errors.push(
            `Invalid refund at row ${itemIndex + 1}. Refund must be string`
          );
        } else {
          const refund = this.validateBoolean(item.refund);
          if (refund === null) {
            errors.push(
              `Invalid refund at row ${itemIndex + 1}. Check your spelling!`
            );
          } else {
            item.refund = refund;
          }
        }
      }
      //validate for discount and discPercentage
      if (item.hasOwnProperty(keyToCheckArray[4])) {
        if (typeof item.discount !== 'string') {
          errors.push(
            `Invalid Discount at row ${itemIndex + 1}. Discount must be string`
          );
        } else {
          const discount = this.validateBoolean(item.discount);
          if (discount === null) {
            errors.push(
              `Invalid Discount at row ${itemIndex + 1}. Check your spelling!`
            );
          } else {
            item.discount = discount;
            console.log(item.discount, 'this is discount .... ');
          }
        }
        if (item.hasOwnProperty(keyToCheckArray[5])) {
          if (typeof item.discPercentage !== 'string') {
            errors.push(
              `Invalid Discount Percentage at row ${
                itemIndex + 1
              }: Must be string!`
            );
          } else if (!this.isValidDiscountPercentage(item.discPercentage)) {
            errors.push(
              `Invalid Discount Percentage at row ${
                itemIndex + 1
              }: Must be number between 0 and 100`
            );
          }
          if (item.discount === false) {
            errors.push(
              `Invalid Discount Percentage at row ${
                itemIndex + 1
              }: you can not have % value if your Discount value is false`
            );
          }
        } else if (item.discount === true) {
          errors.push(
            `Please put value in Discount Percentage if discount is true at row ${
              itemIndex + 1
            }`
          );
        }
      } else if (item.hasOwnProperty(keyToCheckArray[5])) {
        errors.push(
          `You must have column Discount to input discount percentage value at row ${
            itemIndex + 1
          }`
        );
      }
    }
    return errors;
  }
  isValidDiscountPercentage(discPercentage: string): boolean {
    // Convert the string to a floating-point number
    const parsedDiscount = parseFloat(discPercentage);

    // Check if the parsedDiscount is a valid number and within the range of 0 to 100
    return (
      !isNaN(parsedDiscount) && parsedDiscount >= 0 && parsedDiscount <= 100
    );
  }
  isDateFormatValid(orderDate: string): boolean {
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateFormatRegex.test(orderDate);
  }
  isValidCounterNo(counterNo: string): boolean {
    // Convert the string to an integer
    const parsedCounterNo = parseInt(counterNo, 10);

    // Check if the parsedCounterNo is a valid integer and within the range of 1 to 10
    return (
      !isNaN(parsedCounterNo) && parsedCounterNo >= 1 && parsedCounterNo <= 10
    );
  }
  //
  validateBoolean(value: string): boolean | null {
    const lowerCaseValue = value.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    if (lowerCaseValue === 'true') {
      return true;
    } else if (lowerCaseValue === 'false') {
      return false;
    } else {
      return null; // Not a valid boolean representation
    }
  }
  clearSuccessMessage() {
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  transformData(inputData: any[]): any[] {
    // Change all keys into lowercase and remove space
    let standardData = inputData.map((item) => {
      const standardformat: any = {};
      Object.keys(item).forEach((key) => {
        const newKey = key.toLowerCase().replace(/\s+/g, '');
        standardformat[newKey] = item[key];
      });
      return standardformat;
    });

    console.log(standardData, 'this is Standard Data ');

    return standardData.map((item) => {
      const transformedItem: any = {};

      Object.keys(item).forEach((key) => {
        const value = item[key];

        switch (key) {
          case 'counterno':
            const firstIndexNo = key.indexOf('n');
            const secondIndexNo = key.indexOf('n', firstIndexNo + 1);

            if (firstIndexNo !== -1 && secondIndexNo !== -1) {
              transformedItem[
                key.substring(0, secondIndexNo) +
                  'N' +
                  key.substring(secondIndexNo + 1)
              ] = value;
            } else {
              transformedItem[key.replace(/\s+/g, '')] = value;
            }
            break;

          case 'cashiername':
            transformedItem[key.replace(/\s+/g, '').replace('n', 'N')] = value;
            break;

          case 'orderdate':
            const firstIndex = key.indexOf('d');
            const secondIndex = key.indexOf('d', firstIndex + 1);

            if (firstIndex !== -1 && secondIndex !== -1) {
              transformedItem[
                key.substring(0, secondIndex) +
                  'D' +
                  key.substring(secondIndex + 1)
              ] = value;
            } else {
              transformedItem[key.replace(/\s+/g, '')] =
                value ;
            }
            break;

          case 'refund':
          case 'discount':
            transformedItem[key] = value;
            break;

          case 'discpercentage':
            transformedItem[key.replace('p', 'P')] = value;
            break;

          default:
            transformedItem[key.toLowerCase().replace(/\s+/g, '')] = value;
            break;
        }
      });

      return transformedItem;
    });
  }
}
