import { ModalDetailPage } from './../modal-detail/modal-detail.page';
import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Plugins, PushNotification, PushNotificationToken, PushNotificationActionPerformed } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';

const { PushNotifications } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {

  public posts: any;
  private postSubscription: Subscription;
  //searchBar
  textoBuscar = '';

  constructor(
    private appService: AppService,
    private firestore: AngularFirestore,
    private modalCtrl: ModalController
  ) { }

  searchPost(event) {
    //capturamos eltexto del searchbar
    const texto = event.target.value;
    this.textoBuscar = texto;
    console.log(texto);
  }

  getColorBorder(category) {
    switch (category) {
      case 'Trafico Vehicular':
        return '#2dd36f ridge';
      case 'Puesto Policial':
        return '#129cff ridge';
      case 'Accidente de Tránsito':
        return '#ffc409 ridge';
    }
  }

  getColorText(category) {
    switch (category) {
      case 'Trafico Vehicular':
        return '#2dd36f ridge';
      case 'Puesto Policial':
        return '#129cff ridge';
      case 'Accidente de Tránsito':
        return '#ffc409 ridge';
    }
  }

  ngOnInit() {
    this.getPosts();
    console.log('Initializing HomePage');

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting

    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        console.log("Push registration success");
      }
    );

    PushNotifications.addListener('registrationError',
      (error: any) => {
        console.log("Error on registration");
      }
    );

    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        console.log("Push received");
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        console.log("Push action performed");
      }
    );
  }


  async showModal(id: string) {
    console.log(id);
    const modal = await this.modalCtrl.create({
      component: ModalDetailPage,
      cssClass: 'my-custom-class',
      componentProps: {
        id: id,
      }
    });

    //lanzamos el modal
    await modal.present();
  }

  searchByCity() {
    this.appService.showToast("Función no habilitada");
  }

  async getPosts() {
    try {
      this.postSubscription = this.firestore.collection("posts", ref => ref.orderBy("timestamp", "desc")).snapshotChanges().subscribe(
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

  ngOnDestroy() {
    this.postSubscription.unsubscribe();
  }

}
