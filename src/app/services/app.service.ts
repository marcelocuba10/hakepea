import { Injectable } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';
import { User } from '../models/user.model';
import { AngularFireAuth } from '@angular/fire/auth';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private afAuth: AngularFireAuth
  ) { }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000
    }).then(toastData => toastData.present());
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000
    });
    toast.present();
  }

  formValidationUser(user: User) {

    if (!user.email) {
      this.showToast("Enter email");
      return false;
    }

    if (!user.password) {
      this.showToast("Enter password");
      return false;
    }

    return true;
  }

  formValidation(post: Post) {
    if (!post.detail) {
      this.presentToast("Enter detail");
      return false;
    }
    return true;
  }

  async register(user: User) {

    try {
      return this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
        .then(data => {
          console.log(data);

          //redirect   to home
          this.navCtrl.navigateRoot("home");
        }
        );

    } catch (error) {
      this.showToast(error);
    }
  }

  async login(user: User) {
    try {
      return this.afAuth.signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
          console.log(data);

          this.navCtrl.navigateRoot("admin");
        })

    } catch (error) {
      this.showToast(error);
    }
  }


}
