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

  async getCards() {
    return await this.firestore.collection("about").valueChanges();
  }


  async formValidation(model, page) {

    if (page == "post") {
      if (!model.detail) {
        this.presentAlert("Ingrese un aviso");
        return false;
      }
      if (!model.category) {
        this.presentAlert("Seleccione una categoría");
        return false;
      }
    }

    if (page == "expense") {
      if (!model.nome) {
        this.presentAlert("Insira o nome");
        return false;
      }
      if (!model.id_veiculo) {
        this.presentAlert("Selecione um veiculo");
        return false;
      }
    }

    if (page == "car") {
      if (!model.nome) {
        this.presentAlert("Ingrese o nome");
        this.loading.dismiss();
        return false;
      }
      if (!model.modelo) {
        this.presentAlert("Ingrese o modelo");
        this.loading.dismiss();
        return false;
      }
      if (!model.km) {
        this.presentAlert("Ingrese o quilometragem atual");
        this.loading.dismiss();
        return false;
      }
      if (!model.cambio) {
        this.presentAlert("Ingrese o cambio");
        this.loading.dismiss();
        return false;
      }
      if (!model.marca) {
        this.presentAlert("Ingrese a marca");
        this.loading.dismiss();
        return false;
      }
      if (!model.cor) {
        this.presentAlert("Ingrese o cor");
        this.loading.dismiss();
        return false;
      }
      if (!model.carroceria) {
        this.presentAlert("Ingrese a carroceria");
        this.loading.dismiss();
        return false;
      }
      if (!model.portas) {
        this.presentAlert("Ingrese a quantidade de portas");
        this.loading.dismiss();
        return false;
      }
      if (!model.motorizacao) {
        this.presentAlert("Ingrese motorizacao");
        this.loading.dismiss();
        return false;
      }
      if (!model.combustivel) {
        this.presentAlert("Ingrese o tipo de combustivel");
        this.loading.dismiss();
        return false;
      }
      if (!model.chassi) {
        this.presentAlert("Ingrese o nro do chassi");
        this.loading.dismiss();
        return false;
      }
    }

    return true;

  }

}
