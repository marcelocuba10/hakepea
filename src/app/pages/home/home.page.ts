import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';

import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';

const { PushNotifications } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  posts: any;
  contentLoaded = false; //skeleton variable

  constructor(
    private loadingCtrl: LoadingController,
    private appService: AppService,
    private firestore: AngularFirestore
  ) {
    this.getPost();
    
    setTimeout(() => {
      this.contentLoaded = true;
    }, 2000);
    
  }

  ngOnInit() {
    //this.getPost();

    console.log('Initializing HomePage');

    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    PushNotifications.requestPermission().then(result => {
      if (result.granted) {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();
      } else {
        // Show some error
      }
    });

    PushNotifications.addListener('registration',
      (token: PushNotificationToken) => {
        //alert('Push registration success, token: ' + token.value);
        console.log("Push registration success");
      }
    );

    PushNotifications.addListener('registrationError',
      (error: any) => {
        //alert('Error on registration: ' + JSON.stringify(error));
        console.log("Error on registration");
      }
    );

    PushNotifications.addListener('pushNotificationReceived',
      (notification: PushNotification) => {
        //alert('Push received: ' + JSON.stringify(notification));
        console.log("Push received");
      }
    );

    PushNotifications.addListener('pushNotificationActionPerformed',
      (notification: PushNotificationActionPerformed) => {
        //alert('Push action performed: ' + JSON.stringify(notification));
        console.log("Push action performed");
      }
    );
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

}
