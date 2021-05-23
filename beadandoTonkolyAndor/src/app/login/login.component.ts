import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConnectionService } from '../utils/connection.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username: string;
  password: string;

  username_reg: string;
  password_reg: string;
  email_reg: string;

  constructor(private connectionService: ConnectionService, private router: Router) {
    this.username = '';
    this.password = '';
    this.username_reg = '';
    this.password_reg = '';
    this.email_reg = '';
  }

  login() {
    if (this.username != '' && this.password != '') {
      this.connectionService.login(this.username, this.password).subscribe(msg => {
        console.log(msg);
        localStorage.setItem('username', this.username);
        this.router.navigate(['/orders',this.username]);
      }, error => {
        console.log(error);
      })
    }
  }

  register() {
    if (this.username_reg != '' && this.password_reg != '' && this.email_reg != '') {
      this.connectionService.register(this.username_reg, this.password_reg,this.email_reg).subscribe(msg => {
        console.log(msg);
        this.connectionService.login(this.username_reg, this.password_reg).subscribe(message => {
          console.log(message);
          localStorage.setItem('username', this.username_reg);
          this.router.navigate(['/orders',this.username_reg]);
        }, err => {
          console.log(err);
        })
      }, error => {
        console.log(error);
      })
    }
  }

  ngOnInit(): void {
    if (localStorage.getItem('username')) {
      localStorage.removeItem('username');
      this.connectionService.logout().subscribe(msg => {
        console.log(msg);
      }, error => {
        console.log(error);
      })
    }
  }
}
