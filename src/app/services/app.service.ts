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
    if (!post.detail || post.detail == "") {
      this.presentToast("Ingrese una descripción");
      return false;
    } else {
      return true;
    }
  }

  async getPostById(id: string) {
    try {
      return this.firestore.doc("posts/" + id);
    } catch (error) {
      this.presentToast(error);
    }
  }

  async deletePost(id: string) {
    try {
      return await this.firestore.doc("posts/" + id).delete();
    } catch (error) {
      this.presentToast(error);
      console.log(error);
    }
  }

  async getPosts() {
    try {
      return await this.firestore.collection("posts").valueChanges();
    } catch (error) {
      this.presentToast(error);
    }
  }

  async getCards() {
    try {
      return await this.firestore.collection("about").valueChanges();
    } catch (error) {
      this.presentToast(error);
    }
  }


}
