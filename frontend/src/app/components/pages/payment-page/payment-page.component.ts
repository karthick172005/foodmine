import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Order } from '../../../shared/models/Order';
import { OrderService } from '../../../services/order.service';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css']
})
export class PaymentPageComponent implements OnInit {
  order:Order = new Order();
  constructor(orderService: OrderService, router: Router) {
      orderService.getNewOrderForCurrentUser().subscribe({
        next: (order) => {
          this.order = order;
        },
        error:() => {
          router.navigateByUrl('/chekcout');
        }
      })
   }
  ngOnInit(): void {
  }
}
