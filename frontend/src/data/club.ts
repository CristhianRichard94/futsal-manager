export interface Club {
  id: string;
  name: string;
  location: string;
  prices: Array<ShiftPrice>;
  openHour: number;
  closingHour: number;
  profileImage: string;
  images: Array<string>;
  phone: number;
}

export interface ShiftPrice {
  amount: number;
  hourFrom: number;
}
