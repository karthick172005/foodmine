import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { USER_LOGIN_URL, USER_REGISTER_URL } from '../shared/constants/urls';
import { IUserLogin } from '../shared/interfaces/IUserLogin';
import { IUserRegister } from '../shared/interfaces/IUserRegister';
import { User } from '../shared/models/User';
import { isPlatformBrowser } from '@angular/common';
const USER_KEY = 'User';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject =
  new BehaviorSubject<User>(this.getUserFromLocalStorage());
  public userObservable:Observable<User>;
  constructor(private http:HttpClient, private toastrService:ToastrService,@Inject(PLATFORM_ID) private platformId: Object) {
    this.userObservable = this.userSubject.asObservable();
  }

  public get currentUser():User{
    return this.userSubject.value;
  }

  login(userLogin:IUserLogin):Observable<User>{
    return this.http.post<User>(USER_LOGIN_URL, userLogin).pipe(
      tap({
        next: (user) =>{
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Welcome to Foodmine ${user.name}!`,
            'Login Successful'
          )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error, 'Login Failed');
        }
      })
    );
  }
  register(userRegiser:IUserRegister): Observable<User>{
    return this.http.post<User>(USER_REGISTER_URL, userRegiser).pipe(
      tap({
        next: (user) => {
          this.setUserToLocalStorage(user);
          this.userSubject.next(user);
          this.toastrService.success(
            `Welcome to the Foodmine ${user.name}`,
            'Register Successful'
          )
        },
        error: (errorResponse) => {
          this.toastrService.error(errorResponse.error,
            'Register Failed')
        }
      })
    )
  }
  logout() {
    this.userSubject.next(new User());
    if (isPlatformBrowser(this.platformId)) { // Check if we're in the browser
      localStorage.removeItem(USER_KEY);
    }
    window.location.reload();
  }

  private setUserToLocalStorage(user: User) {
    if (isPlatformBrowser(this.platformId)) { // Check if we're in the browser
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }

  private getUserFromLocalStorage(): User {
    if (isPlatformBrowser(this.platformId)) { // Check if we're in the browser
      const userJson = localStorage.getItem(USER_KEY);
      if (userJson) return JSON.parse(userJson) as User;
    }
    return new User(); // Return a new empty user if no user is found or if on the server
  }
}
