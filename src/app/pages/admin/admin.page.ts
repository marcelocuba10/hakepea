import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
  posts: any;
  contentLoaded = false; //skeleton variable

  constructor(
    private appService: AppService,
    private firestore: AngularFirestore,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController
  ) {
    setTimeout(() => {
      this.contentLoaded = true;
    }, 2000);
  }

  ngOnInit() {
    this.getPost();
  }

  async getPost() {
    //previamente se mostrara el skeleton

    try {
      this.firestore.collection("posts").
        snapshotChanges().
        subscribe(data => {
          this.posts = data.map(e => {
            return {
              id: e.payload.doc.id,
              detail: e.payload.doc.data()["detail"],
              category: e.payload.doc.data()["category"],
              date: e.payload.doc.data()["date"],
              imgpath: e.payload.doc.data()["imgpath"]
            };
          });
        });
    } catch (error) {
      this.appService.showToast(error);
    }
  }

  async deletePost(id: string) {
    //show loader
    let loader = await this.loadingCtrl.create({
      message: "Please wait..."
    });

    await loader.present();

    await this.firestore.doc("posts/" + id).delete();

    //dismiss loader
    await loader.dismiss();
  }

  async onLogout() {
    this.presentAlertConfirm();
  }

  async presentAlertConfirm() {
    const alert = await this.alertCtrl.create({
      header: 'Aviso',
      message: 'Desea cerrar sesion?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancelar',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Cerrar Sesion',
          handler: () => {
            console.log('Confirm Okay, Logout!');
            this.afAuth.signOut();
            this.navCtrl.navigateRoot('login');
            this.appService.showToast('Sesion Cerrada');
          }
        }
      ]
    });

    await alert.present();
  }

}
