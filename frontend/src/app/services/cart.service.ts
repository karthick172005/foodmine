import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Cart } from '../shared/models/cart';
import { CartItem } from '../shared/models/CartItem';
import { Food } from '../shared/models/Food';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Cart = this.getCartFromLocalStorage();
  private cartSubject: BehaviorSubject<Cart> = new BehaviorSubject(this.cart);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { // Inject PLATFORM_ID
    this.cart = this.getCartFromLocalStorage();
    this.cartSubject = new BehaviorSubject(this.cart);
  }

  addToCart(food: Food): void {
    let cartItem = this.cart.items
      .find(item => item.food.id === food.id);
    if (cartItem) return;

    this.cart.items.push(new CartItem(food));
    this.setCartToLocalStorage();
  }

  removeFromCart(foodId: string): void {
    this.cart.items = this.cart.items
      .filter(item => item.food.id !== foodId);
    this.setCartToLocalStorage();
  }

  changeQuantity(foodId: string, quantity: number): void {
    let cartItem = this.cart.items
      .find(item => item.food.id === foodId);
    if (!cartItem) return;

    cartItem.quantity = quantity;
    cartItem.price = quantity * cartItem.food.price;
    this.setCartToLocalStorage();
  }

  clearCart(): void {
    this.cart = new Cart();
    this.setCartToLocalStorage();
  }

  getCartObservable(): Observable<Cart> {
    return this.cartSubject.asObservable();
  }
  getCart(): Cart{
    return this.cartSubject.value;
  }

  private setCartToLocalStorage(): void {
    this.cart.totalPrice = this.cart.items
      .reduce((prevSum, currentItem) => prevSum + currentItem.price, 0);
    this.cart.totalCount = this.cart.items
      .reduce((prevSum, currentItem) => prevSum + currentItem.quantity, 0);

    if (isPlatformBrowser(this.platformId)) { // Ensure this runs only in browser
      const cartJson = JSON.stringify(this.cart);
      localStorage.setItem('Cart', cartJson);
    }
    this.cartSubject.next(this.cart);
  }

  private getCartFromLocalStorage(): Cart {
    if (isPlatformBrowser(this.platformId)) { // Check if running in browser
      try {
        const cartJson = localStorage.getItem('Cart');
        const cart = cartJson ? JSON.parse(cartJson) : new Cart();
        cart.items = cart.items || []; // Ensure cart.items is initialized as an array
        return cart;
      } catch (error) {
        console.error('Error parsing cart from local storage', error);
        return new Cart(); // Return a new empty cart in case of error
      }
    }
    return new Cart(); // Return an empty cart on the server side
  }
}
