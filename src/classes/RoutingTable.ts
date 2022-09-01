export class RoutingTable {
  numberRows: number;
  commonHops?: Map<number, Array<string>>;

  constructor(numberRows: number) {
    this.numberRows = numberRows;
  }

  disp(): void {
    //
  }

  increaseRowNumber(): void {
    this.numberRows++;
  }

  updateCommonHopRecord(){
    //
  }

}
