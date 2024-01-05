import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HeroService } from '../hero.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css', './print-styles.css']
})
export class OverviewComponent implements OnInit{
  @ViewChild('fileInput') fileInput!: ElementRef;
  error: any;
constructor(
  private api: HeroService,
    private http: HttpClient, // private route: Router
    private router: Router
){}
pagedItems: any[] = [];
pageSize = 5; // Number of items per page
currentPage = 1; // Current page
searchText?: any;
APIdata: any = [];
colList: any = ["Order Id", "Counter No", "Cashier Name", "Order Date", "Refund", "Discount", " % "];
  ngOnInit() {
  //  const response =  await this.api.APIcallservice2();
  //  this.APIdata = response.books
   this.getAll();

  }
  ngOnDestroy() {
    if (this.api.movieSubscription) {
      this.api.movieSubscription.unsubscribe();
    }
  }

async getAll() {
  // var saveData = {
  //   order_id: this.order_id,
  //   counter_no: this.counter_no,
  //   casher_name: this.casher_name,
  //   order_date: this.order_date,
  //   refund: this.refund,
  //   discount: this.discount,
  //   discount_percentage: this.discount_percentage
  // };
  await this.api.read().subscribe({
    next: (res: any) => {
      console.log(res, 'response');
      res.books.sort((a :any, b: any) => a.orderID - b.orderID);
      this.api.data = res
      // this.APIdata = res.books.sort((a :any, b: any) => a.orderID - b.orderID);
      // this.APIdata = res.books
      return this.APIdata = res.books
    },
    error: (err: any) => {
      this.error = err.error.errors;
      console.log(err.message);
    },
  });
}
goToForm(){
  this.api.newbook = true;
  this.router.navigateByUrl("book");
}
print(item: any){
  console.log(item)
}
goToEdit(item: any){
  console.log(item);
  const list = this.api.data.books
  // this.api.index = list.findIndex((item: { id: any; }) => item.id === item.id);

  this.api.index = list.indexOf(item)
  console.log(this.api.index)
  this.router.navigateByUrl("book");

}

exportToExcel(dataArray: any, fileName: string) {
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(dataArray);
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
}

readExcel(file: File) {
  const reader: FileReader = new FileReader();

  reader.onload = (e: any) => {
    const data = new Uint8Array(e.target.result);
    const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

    // Assuming you have only one sheet in the Excel file
    const firstSheetName = workbook.SheetNames[0];
    const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

    // Parse the data as needed
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
    console.log(jsonData);
  };

  reader.readAsArrayBuffer(file);
}
openFileInput() {
  // Trigger a click on the hidden file input
  this.fileInput.nativeElement.click();
}

onFileChange(event: any) {
  console.log("on File Change");
  const file = event.target.files[0];
  if (file) {
    // console.log("in if file .... ")
    console.log('Selected file:', file);
    this.readExcel(file);
  }
}
printDoc() {
  window.print();
}

validateImportedData(data: any[]): string[] {
  const errors: string[] = [];

  //  Check if 'cashierName' and 'counterNo' column is present and not empty
  const cashierNameIndex = data[0].indexOf('cashierName');
  const counterNoIndex = data[0].indexOf('counterNo');
  if (cashierNameIndex === -1 || counterNoIndex ===-1 ) {
    if (cashierNameIndex === -1 ){
      errors.push('Missing required column: cashierName');
    }
    errors.push('Missing required column: counterNo');
}else {
    for (let i = 1; i < data.length; i++) {
      const cashierName = data[i][cashierNameIndex];
      const counterNo = data[i][counterNoIndex];
      // Validate name format (replace with your specific validation)
      if (!cashierName || typeof cashierName !== 'string') {
        errors.push(`Invalid cashierName at row ${i + 1}`);

      }
    }
  }

  // Add more validation checks based on your requirements

  return errors;
}



}
