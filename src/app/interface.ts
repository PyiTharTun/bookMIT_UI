export interface booksFrame{
  orderID?: number | null;
  counterNo?: number | null;
  cashierName?: string;
  orderDate?: Date ;
  refund?: string;
  noRefund?:boolean;
  discount?: boolean;
  // discountON ?:boolean
  discPercentage?: number | null;
}
