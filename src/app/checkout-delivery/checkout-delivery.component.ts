import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { DataService } from "../data.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup, FormBuilder } from "@angular/forms";

@Component({
  selector: "app-checkout-delivery",
  templateUrl: "./checkout-delivery.component.html",
  styleUrls: ["./checkout-delivery.component.scss"]
})
export class CheckoutDeliveryComponent implements OnInit {
  pushCartItemArray: any = [];
  pushCartItemInDb: any = [];
  productID: any;
  product;
  private routerSub: any;
  public totalAmount: any = 0;
  public tax: any = 0;
  public finalTotal: any = 0;
  public shippingCharges: any = 0;
  public name: string;
  public address: string;
  public city: string;
  public email: string;
  public cartForm: FormGroup;

  constructor(
    private data: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authServie: AuthService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadProductsForCart();
    const id = this.authServie.getUserId();
    this.http.get("/api/user/" + id).subscribe(res => {
      console.log(res);
      this.name = res["firstName"] + " " + res["lastName"];
      this.address = res["Address1"] + " " + res["Address2"];
      this.city = res["city"] + ", " + res["postalCode"];
      this.email = res["email"];
    });
  }

  openVerticallyCentered(content) {
    this.modalService.open(content, { centered: true });

    const data = {
      user_email: this.email,
      order_status: 1,
      total_cost: this.finalTotal,
      date_of_order: Date.now.toString(),
      items: this.pushCartItemInDb
    };

    this.http
      .post("/api/admin/saveOrders", data)
      .subscribe(response => {
        console.log(response);
      });

    localStorage.clear();
  }

  loadProductsForCart() {
    this.routerSub = this.route.params.subscribe(async params => {
      var cartItems = JSON.parse(localStorage.getItem("cartProducts"));
      var cartQuantity = JSON.parse(localStorage.getItem("cartQuantity"));
      if (cartItems) {
        let count = 0;
        for (let cartValues of cartItems) {
          this.productID = cartValues;
          // this.selectedQuantity =  '1';
          let currentProductQuantity = cartQuantity[count];

          count = count + 1;
          this.product = await this.http
            .get(this.data.productAPIURL + `/product?id=${this.productID}`)
            .toPromise();
          this.product = this.product[0];
          // tslint:disable-next-line:max-line-length
          this.totalAmount =
            this.totalAmount +
            this.product.product_price * currentProductQuantity;

          this.pushCartItemInDb.push({
            _id: this.productID,
            name: this.product.product_name,
            quantity: currentProductQuantity,
            stock: "1",
            status: "1"
          });
          this.pushCartItemArray.push({
            productImage: this.product.product_image,
            productName: this.product.product_name,
            productPrice: this.product.product_price,
            productQuantity: currentProductQuantity,
            productAmount: this.product.product_price * currentProductQuantity
          });
        }
        if (this.totalAmount >= 50.0) {
          this.shippingCharges = 0.0;
        } else {
          this.shippingCharges = this.totalAmount * 0.05;
        }
        this.tax = this.totalAmount * 0.15;
        this.finalTotal = this.totalAmount + this.tax + this.shippingCharges;
        console.log(this.totalAmount);
        console.log(this.tax);
        console.log(this.shippingCharges);
        console.log(this.finalTotal);
      }
    });
  }
}
