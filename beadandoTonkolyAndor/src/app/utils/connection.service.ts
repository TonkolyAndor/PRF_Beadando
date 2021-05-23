import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OrdersModel } from 'models/user_orders.model'
import { Console } from 'node:console';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  constructor(
    private http: HttpClient) { }


  //====================================== Rendeles muveletek ========================================================


  //Rendelesek (kosar) lekerese felhasznalonev alapjan
  getOrders(){
    return this.http.get(environment.serverUrl+'/user_orders',{withCredentials: true});
  }

  //Rendelesek (kosar) modosítasa felhasznalonev alapjan
  updateOrders(username: String, orders:Array<any>){//updateljük a rendeleseket
    return this.http.put(environment.serverUrl+'/user_orders',
    {username: username, orders: orders},
    {withCredentials: true,
      responseType: 'text', observe: 'response' as 'response'});
  }


  //====================================== Termek muveletek ========================================================


  //Termekek lekerese
  getProducts(){
    return this.http.get(environment.serverUrl+'/products',{withCredentials: true});
  }

  //Termek modositasa
  updateProducts(name: String, amount: number){//updateljük a products-t
    return this.http.put(environment.serverUrl+'/products',
    {name: name, amount: amount},
    {withCredentials: true,
      responseType: 'text', observe: 'response' as 'response'});
  }




  //====================================== Felhasznaloi muveletek ========================================================

  //Bejelentkezes
  login(username: string, password: string) {
    return this.http.post(environment.serverUrl + '/login', {username: username, password: password},
    {withCredentials: true,
    responseType: 'text', observe: 'response' as 'response'});
  }

  //Kijelentkezes
  logout() {
    return this.http.post(environment.serverUrl + '/logout',{},
    {withCredentials: true, responseType: 'text'});
  }

  //Regisztracio
  register(username: string, password: string, email: string){
    return this.http.post(environment.serverUrl + '/user_orders', {username: username, password: password, email: email},
    {withCredentials: true,
    responseType: 'text', observe: 'response' as 'response'});
  }


  //====================================== PostgreSQL muveletek========================================================


  //Tarolt termekek lekerese
  getProductsFromPostgreSQL(){
    return this.http.get(environment.postgresqlServerUrl+'/products',{responseType: 'text', observe: 'response' as 'response'});
  }

  //Tarolt tranzakciok lekerese
  getTransactionsFromPostgreSQL(){
    return this.http.get(environment.postgresqlServerUrl+'/transactions',{responseType: 'text', observe: 'response' as 'response'});
  }

  //Termek hozzaadasa
  addProductToPostgreSQL(name: string, price: number){
    return this.http.post(environment.postgresqlServerUrl+'/products',{name: name, price: price},{responseType: 'text', observe: 'response' as 'response'});
  }

  //Tranzakcio hozzaadasa (tranzakcio mentese)
  addTransactionToPostgreSQL(date: Date, product_id: number, price: number){
    return this.http.post(environment.postgresqlServerUrl+'/transactions',{date: date, product_id: product_id, price: price},{responseType: 'text', observe: 'response' as 'response'});
  }
}
