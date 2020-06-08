import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';

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

}
