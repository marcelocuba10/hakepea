import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from '../models/user.model';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user = {} as User;
  public isLogged: any = false;

  constructor(
    public afAuth: AngularFireAuth,
    private appservice: AppService
  ) {
    afAuth.authState.subscribe(user => (this.isLogged = user));
  }

  //login

  async login(user: User) {
    try {
      return await this.afAuth.signInWithEmailAndPassword(user.email, user.password);
    } catch (error) {
      this.appservice.presentToast(error);
      console.log(error);
    }
  }

  //register

  async onRegister(user: User) {
    try {
      return await this.afAuth.createUserWithEmailAndPassword(user.email, user.password);
    } catch (error) {
      this.appservice.presentToast(error);
      console.log(error);
    }
  }

}
