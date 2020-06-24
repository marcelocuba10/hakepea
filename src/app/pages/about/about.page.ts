import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';

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
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

}
