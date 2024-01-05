import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchPipe'
})
export class SearchPipePipe implements PipeTransform {

  transform(APIdata: any, searchText: string): any {
    if (!Array.isArray(APIdata) || !searchText) {
      return APIdata;
    }
    searchText = searchText.toLowerCase();
    return APIdata.filter(
      (books: any) =>
      (books.orderID && books.orderID.toString().includes(searchText)) ||
      (books.counterNo && books.counterNo.toString().includes(searchText)) ||
        (books.cashierName && books.cashierName.toLowerCase().includes(searchText))||
        (books.orderDate === 'Date' &&
          books.orderDate.toLowerCase().includes(searchText)) ||
        (books.refund && books.refund.toString().includes(searchText)) ||
        (books.discount && books.discount.toString().includes(searchText))


    );

  }

}
