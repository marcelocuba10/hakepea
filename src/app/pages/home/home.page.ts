import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';

import {
  Plugins,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed
} from '@capacitor/core';
import { Subscription } from 'rxjs';

const { PushNotifications } = Plugins;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {

  public posts: any;
  public postList: []; //search function
  private postSubscription: Subscription;

  constructor(
    private appService: AppService,
    private firestore: AngularFirestore
  ) { }

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
    this.getPosts();

    //this.postList = this.initializePosts();
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

  // search(evt) {
  //   var key: string = evt.target.value;
  //   var lowerCaseKey = key.toLowerCase();
  //   if (lowerCaseKey.length > 0) {
  //     this.firestore.collection("posts",orderByChild("detail").startAt(lowerCaseKey).endAt(lowerCaseKey + "\uf8ff"))
  //       .once("value", snapshot => {
  //         this.postList = [];

  //         snapshot.forEach(childSnap => {
  //           this.postList.push(childSnap.val());
  //         })
  //       })
  //   } else {
  //     this.postList = [];
  //   }

  // }


  //searchbar option 1 
  // async initializePosts() {
  //   const postList = await this.firestore.collection("posts", ref => ref.orderBy("timestamp", "desc")).valueChanges().pipe(first()).toPromise();
  //   return postList;
  // }

  // async filterList(evt) {
  //   console.log(evt);
  //   this.postList = await this.initializePosts();
  //   const searchTerm = evt.srcElement.value;

  //   if (!searchTerm) {
  //     return;
  //   }

  //   this.postList = this.postList.filter(currentPost => {
  //     if (currentPost.detail && searchTerm) {
  //       return (currentPost.detail.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || currentPost.category.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
  //     }
  //   })
  // }

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
