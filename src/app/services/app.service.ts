import { Injectable } from '@angular/core';
import { ToastController, NavController, LoadingController, AlertController } from '@ionic/angular';
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
    private firestore: AngularFirestore,
    private alertCtrl: AlertController
  ) { }

  async presentAlert(message: string) {
    const alert = await this.alertCtrl.create({
      cssClass: 'my-custom-class',
      header: 'Atencion',
      message: message,
      buttons: ['OK']
    });

    await alert.present();
  }

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

  async getPostById(id: string) {
    return this.firestore.doc("posts/" + id);
  }

  async deletePost(id: string) {
    return await this.firestore.doc("posts/" + id).delete();
  }

  async deleteComment(id: string) {
    return await this.firestore.doc("comments/" + id).delete();
  }

  async getPosts() {
    return await this.firestore.collection("posts").valueChanges();
  }

  async getCards() {
    return await this.firestore.collection("about").valueChanges();
  }


}
