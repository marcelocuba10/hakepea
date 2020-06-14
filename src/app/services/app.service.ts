import { Injectable } from '@angular/core';
import { ToastController, NavController, LoadingController } from '@ionic/angular';
import { User } from '../models/user.model';
import { AngularFireAuth } from '@angular/fire/auth';
import { Post } from '../models/post.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  post = {} as Post;
  posts: any;

  constructor(
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private loadingCtrl: LoadingController,
    private firestore: AngularFirestore
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

  async getPostById(id: string) {
    try {
      return this.firestore.doc("posts/" + id);
    } catch (error) {
      this.presentToast(error);
    }
  }

  // async getPosts() {
  //   try {
  //     return this.firestore.collection("posts").valueChanges();
  //   } catch (error) {
  //     this.presentToast(error);
  //   }
  // }

  async getCards() {
    try {
      return this.firestore.collection("about").valueChanges();
    } catch (error) {
      this.presentToast(error);
    }
  }


}
