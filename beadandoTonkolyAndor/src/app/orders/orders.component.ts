import { DatePipe } from '@angular/common';
import { error, stringify } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { element } from 'protractor';
import { environment } from 'src/environments/environment';
import { ConnectionService } from '../utils/connection.service';


@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  username = '';
  myDate = new Date();




  user: any;

  orders:Array<any> = [];
  received:Array<any> = [];
  names:Array<string> = [];

  usrname:String = '';
  pw:String = '';
  email:String = '';
  accessLevel:String = '';


  foundIndex: number = -1;




  receivedProducts:Array<any> = [];
  products:Array<any> = [];

  amount: number=-1;



  maxProductId: number = -1;
  productIds: Array<number> = [];
  id2: number = -1;


  constructor(private connectionService: ConnectionService, private router: Router, private route: ActivatedRoute) {
    console.log(this.username);
  }

  //termek torlese
  remove(name: string) {
    this.foundIndex = -1;
    this.foundIndex = this.orders.findIndex(x => x[0].name === name);
    if (this.foundIndex > -1) {
      if (this.orders[this.foundIndex][0].amount == 1) {
        //amennyiben ez az utolso termek a kosarban töröljuk a kosar elemet
        this.orders.splice(this.foundIndex, 1);
      } else {
        //amennyiben nem ez az utolso elem, csokkentjuk a mennyiseget
        this.orders[this.foundIndex][0].amount--;
        this.orders[this.foundIndex][0].sum_price = this.orders[this.foundIndex][0].amount * this.orders[this.foundIndex][0].unit_price;
      }

      //a kosar tartalmanak modositasa
      this.connectionService.updateOrders(this.usrname, this.orders).subscribe(data =>{
        this.listCart();
      },error=>{
        console.log(error);
      });

      //a kosarbol kivett termek ujra megvasarolhatova tetele
      //a termekek lekerese
      this.connectionService.getProducts().subscribe(data=>{
        this.products=[];
        this.receivedProducts=[];
        this.receivedProducts.push(JSON.parse(JSON.stringify(data)));
        this.receivedProducts[0].forEach((element: any) =>{
          this.products.push(element);
        });
        //megkeressuk a megfelelo nevu termeket, es noveljuk a belole rendelkezesre allo mennyiseget
        this.foundIndex = -1;
        this.foundIndex = this.products.findIndex(x => x.name === name);
        if (this.foundIndex > -1) {
          this.connectionService.updateProducts(name, this.products[this.foundIndex].amount+1).subscribe(data=>{

          },error=>{
            console.log(error);
          })
        }
      },error=>{
        console.log(error);
      });
    }
  }


  //kosar tartalmanak listazasa
  listCart() {
    this.connectionService.getOrders().subscribe(data =>{
      this.orders=[];
      this.user = data;
      this.usrname = this.user.username;
      this.pw = this.user.password;
      this.email = this.user.email;
      this.accessLevel = this.user.accessLevel;
      this.orders = this.user.orders;

    },error=>{
      console.log(error);
    });
  }

  //navigalas a termekekert felelos komponensre
  goToProducts(){
    this.router.navigate(['/products']);
  }

  //vasarlas veglegesitese
  finalizeShopping(){

    //lekerjuk es letaroljuk a termekeket a PostgreSQL szerverrol
    this.connectionService.getProductsFromPostgreSQL().subscribe(data =>{
      this.names = [];
      this.received = [];
      this.productIds = [];
      this.maxProductId = 0;//a maximalis termekid-t tartalmazo seged valtozo
      this.received=JSON.parse(data.body || '');
      this.received.forEach((element: any) =>{
        if (parseInt(JSON.stringify(element.id)) > this.maxProductId) {
          this.maxProductId = parseInt(JSON.stringify(element.id));
        }
        this.productIds.push(parseInt(JSON.stringify(element.id)));
        this.names.push(element.name);
      });

      //amennyiben nem kaptunk termekeket 1 lesz az id
      if (this.names.length === 0) {
        this.maxProductId = 1;
      }

      //vegiglepkedunk a kosar tartalman
      this.orders.forEach((element: any) =>{
        this.foundIndex = -1;
        this.foundIndex = this.names.findIndex(x => x === JSON.stringify(element[0].name));
        if (this.foundIndex == -1) {
          //ha nincs a termek a PostgreSQL szerverben letarolva letaroljuk
          this.connectionService.addProductToPostgreSQL(JSON.stringify(element[0].name), parseFloat(JSON.stringify(element[0].unit_price))).subscribe(data => {
            this.maxProductId++;


            //hogy a tranzakcio kulso kulcsa jo erteket kapjon ujra lekerjuk a termekeket es kivalasztjuk a max id-t
            this.connectionService.getProductsFromPostgreSQL().subscribe(d=>{
              this.received = [];
              this.received=JSON.parse(d.body || '');
              this.received.forEach((el: any) =>{
                if (parseInt(JSON.stringify(el.id)) > this.id2) {
                  this.id2 = parseInt(JSON.stringify(el.id));
                }
              });


              //tranzakcio hozzaadasa
              this.connectionService.addTransactionToPostgreSQL(new Date(),  this.id2,  element[0].sum_price).subscribe(data => {
                //a kosar torlese
                this.orders = [];
                this.connectionService.updateOrders(this.username, this.orders).subscribe(data =>{
                  this.listCart();
                },error=>{
                  console.log(error);
                });
              },error=>{
                console.log(error);
              });
            },error=>{
              console.log(error);
            });
          },error=>{
            console.log(error);
          });

        } else {
          // ha mar van ilyen termek akkor eleg tranzakciot hozzaadni az adatbazishoz
          this.connectionService.addTransactionToPostgreSQL(new Date(), this.productIds[this.foundIndex], element[0].sum_price).subscribe(data => {
            this.orders = [];
            this.connectionService.updateOrders(this.username, this.orders).subscribe(data =>{
              this.listCart();
            },error=>{
              console.log(error);
            });
          },error=>{
            console.log(error);
          });
        }
      });
    },error=>{
      console.log(error);
    });
  }

  //kosar tartalmanak torlese
  clearCart() {
    this.listCart();

    if (this.orders.length != 0) {
      //lekerjuk a termekeket
      this.connectionService.getProducts().subscribe(data=>{
        this.products=[];
        this.receivedProducts=[];
        this.receivedProducts.push(JSON.parse(JSON.stringify(data)));
        //vegiglepkedunk a termekeken es a kosaron

        //megjegyzes: itt lehetett volna a mashol hasznalt findIndex()-en alapulo megoldast hasznalnom, belefutottam egy hibaba, es nem maradt ido az atirasra
        this.receivedProducts[0].forEach((element: any) =>{
          this.orders.forEach((elem: any) =>{

            //ha a nevek megeyeznek modositjuk a kosarat es a rendeleseket
            if (elem[0].name == element.name) {
              this.connectionService.updateProducts(element.name, (element.amount + elem[0].amount)).subscribe(dat=>{
                this.orders=[];
                this.connectionService.updateOrders(this.username, this.orders).subscribe(d =>{
                  console.log('Mentés sikeres');
                  this.listCart();
                },error=>{
                  console.log(error);
                });
              },error=>{
                console.log(error);
              })
            }
          });
        });
      });
    }
  }

  //felhasznalonev lekerese az URL-bol
  ngOnInit(): void {
    this.route.paramMap.subscribe(params =>{
      this.username=params.get('username') || '';
      this.listCart();
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

}
