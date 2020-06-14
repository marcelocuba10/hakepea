import { Component, OnInit } from '@angular/core';
import {AppService} from '../../services/app.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  cards: any;

  constructor(
    private appService: AppService
  ) { }

  ngOnInit() {
    this.getCards();
  }

  async getCards() {
    try {
      (await this.appService.getCards()).subscribe(data => {
        this.cards = data;
        console.log(this.cards);
      })

      //metodo antiguo sin service
      // this.firestore.collection("posts").
      //   snapshotChanges().
      //   subscribe(data => {
      //     this.posts = data.map(e => {
      //       return {
      //         id: e.payload.doc.id,
      //         detail: e.payload.doc.data()["detail"],
      //         category: e.payload.doc.data()["category"],
      //         date: e.payload.doc.data()["date"],
      //         imgpath: e.payload.doc.data()["imgpath"]
      //       };
      //     });
      //   });
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

}
