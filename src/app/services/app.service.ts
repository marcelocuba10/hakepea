import { Injectable } from '@angular/core';
import { ToastController, NavController, LoadingController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { Post } from '../models/post.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  post = {} as Post;
  posts: any;
  private loading: any;

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
      header: 'Atención',
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

  async presentLoading(status) {
    //status if present 1 or dismiss 0

    if (status == 1) {
      this.loading = await this.loadingCtrl.create({ message: "Espere.." });
      return this.loading.present();
    } else if (status == 0) {
      return this.loading.dismiss();
    }
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

  async getTextInfos() {
    return await this.firestore.collection("about").valueChanges();
  }

  async getTextDisclaimer(){
    return await this.firestore.collection("disclaimer", ref => ref.orderBy("description", "asc")).valueChanges();
  }

  async getCategories() {
    return await this.firestore.collection("categories", ref => ref.orderBy("name", "asc")).valueChanges();
  }

  async formValidation(model, page) {

    if (page == "post") {
      if (!model.detail) {
        this.presentAlert("Escriba una descripción para el aviso");
        return false;
      }
      if (!model.category) {
        this.presentAlert("Selecciona una categoría");
        return false;
      }
    }

    return true;

  }

}
