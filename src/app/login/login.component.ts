import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',

  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  myform: FormGroup;
  public firstname: string;
  isValid = true;
  isLoading = false;
  private authSub: Subscription;
  private rsub;
  public IsUserAuth= false;
  constructor(private fb: FormBuilder, public authService: AuthService,private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.isLoading = true;
    this.authSub = this.authService.getAuthStatusListener().subscribe(
      authStatus=>{
        this.isValid = false;
        console.log("value",this.isValid);
      }
    );
      this.rsub = this.router.events.subscribe(()=>{
        this.IsUserAuth = this.authService.getIsAuth();
      })
    this.myform = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]],
      password: ['', Validators.required],
      remember: ['true']
    });
    if(this.authService.getIsAuth()){
      return this.router.navigate(['/']);
    }
  }

  onSubmit() {
    if (this.myform.invalid) {
    return;
    }
    this.authService.login(this.myform.value.email,this.myform.value.password)
// Display user name to front end
    this.isLoading = false;
    this.firstname = this.authService.getUsernName();
    this.myform.reset();

  }

  ngOnDestroy(){
    this.authSub.unsubscribe();
  }

}

