import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { NavController, AlertController } from '@ionic/angular';
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
    private navCtrl: NavController,
    private afAuth: AngularFireAuth,
    private alertCtrl: AlertController,
  ) {
    setTimeout(() => {
      this.contentLoaded = true;
    }, 2000);
  }

  getColorBorder(category) {
    switch (category) {
      case 'Policía Caminera':
        return '#009925 ridge';
      case 'Policía Municipal':
        return '#36abe0 ridge';
      case 'Policía Nacional':
        return '#3369E8 ridge';
      case 'Accidente de Tránsito':
        return '#D50F25 ridge';
    }
  }

  getColorText(category) {
    switch (category) {
      case 'Policía Caminera':
        return '#009925';
      case 'Policía Municipal':
        return '#36abe0';
      case 'Policía Nacional':
        return '#3369E8';
      case 'Accidente de Tránsito':
        return '#D50F25';
    }
  }

  ngOnInit() {
    this.getPost();
  }

  async getPost() {
    //previamente se mostrara el skeleton

    try {
      this.firestore.collection("posts", ref => ref.orderBy("timestamp", "desc")).snapshotChanges().subscribe(
        data => {
          this.posts = data.map(e => {
            return {
              id: e.payload.doc.id,
              detail: e.payload.doc.data()["detail"],
              category: e.payload.doc.data()["category"],
              date: e.payload.doc.data()["date"],
              imgpath: e.payload.doc.data()["imgpath"],
              liked: e.payload.doc.data()["liked"],
              disliked: e.payload.doc.data()["disliked"]
            };
          });
        });
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  async presentAlertConfirmDelete(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message: 'Desea eliminar este aviso?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Eliminar',
          handler: async () => {
            console.log('Confirm Okay');
            this.appService.deletePost(id);
            this.navCtrl.navigateRoot('admin');
          }
        }
      ]
    });
    await alert.present();
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
