import { Food } from "./Food";

export class CartItem {
  quantity: number = 1;
  price: number;

  constructor(public food: Food) {
    // Now that 'food' is initialized, we can safely assign 'price'
    this.price = this.food.price;
  }
}

