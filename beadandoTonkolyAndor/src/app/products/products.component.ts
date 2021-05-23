import { Component, OnInit } from '@angular/core';
import { stringify } from '@angular/compiler/src/util';
import { Router } from '@angular/router';
import { element } from 'protractor';
import { environment } from 'src/environments/environment';
import { ConnectionService } from '../utils/connection.service';
import { Console } from 'node:console';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {


  username : string;


  constructor(private connectionService: ConnectionService, private router: Router) {
    this.username = localStorage.username;
  }

  title = 'PRF';

  example = ['1_elem'];

  user: any;

  products:Array<any> = [];

  received:Array<any> = [];

  names:Array<string> = [];

  usrname:String = '';
  pw:String = '';
  email:String = '';
  accessLevel:String = '';



  orders:Array<any> = [];

  productFound: any = {};
  foundIndex: number = -1;

  new_order: any = {};

  tempOrders: Array<any> = [];

  addToCart(name: string) {
    this.productFound = this.products.find(x => x.name === name);

    //amennyiben van az adatbazisban megfelelo nevu termek és abbol van megvasarolhato mennyiseg
    if ((this.productFound != undefined) && (this.productFound.amount > 0)) {

      //Rendelesek (kosar) lekerese
      this.connectionService.getOrders().subscribe(data =>{
        this.orders=[];
        this.received=[];
        this.tempOrders=[];
        this.new_order={};
        this.received.push(data);
        this.user = data;
        this.orders = this.user.orders;


        //Ellenorizzuk, hogy a termeket mar tartalmazza-e a kosar
        this.foundIndex = this.orders.findIndex(x => x[0].name === this.productFound.name);
        if (this.foundIndex > -1) {
          //ha nem, uj rendelest szurunk be
          this.new_order.name = this.productFound.name;
          this.new_order.amount = this.orders[this.foundIndex][0].amount + 1;
          this.new_order.unit_price = this.productFound.price;
          this.new_order.sum_price = this.orders[this.foundIndex][0].sum_price + this.productFound.price;


          this.orders.splice(this.foundIndex,1);
          this.tempOrders.push(this.new_order);
          this.orders.push(this.tempOrders);
        } else {
          //ha igen, noveljuk a darabaszamot
          this.new_order.name = this.productFound.name;
          this.new_order.amount = 1;
          this.new_order.unit_price = this.productFound.price;
          this.new_order.sum_price = this.productFound.price;

          this.tempOrders.push(this.new_order);
          this.orders.push(this.tempOrders);
        }
        this.productFound.amount--;

        //frissitjuk a termekeket, csokkentjuk az adott termek darabszamat
        this.connectionService.updateOrders(this.username, this.orders).subscribe(data =>{
          this.connectionService.updateProducts(this.productFound.name, this.productFound.amount).subscribe(data =>{
            this.listProducts();
          },error=>{
            console.log(error);
          });
        },error=>{
          console.log(error);
        });

      },error=>{
        console.log(error);
      });


    }else{
      //Hibauzenet, ha nincs ilyen termek, vagy elfogyott
      console.log("Ilyen termekbol nincs raktaron!");
    }
  }

  //termekek listazasa
  listProducts() {
    this.connectionService.getProducts().subscribe(data =>{
      this.products=[];
      this.received=[];
      this.received.push(JSON.parse(JSON.stringify(data)));
      this.received[0].forEach((element: any) =>{
        this.products.push(element);
      });
    },error=>{
      console.log(error);
    });

  }


  //kijelentkezes
  logout(){
    localStorage.removeItem('username');
    this.connectionService.logout().subscribe(msg => {
      console.log(msg);
      this.router.navigate(['/login']);
    }, error => {
      console.log(error);
    })
  }

  //valtas a szemelyes felhasznaloi oldalra
  goToCart(){
    this.router.navigate(['/orders',this.username]);
  }

  ngOnInit(): void {
    this.listProducts();
  }

}
