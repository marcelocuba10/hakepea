import { AppService } from 'src/app/services/app.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-disclaimer',
  templateUrl: './disclaimer.page.html',
  styleUrls: ['./disclaimer.page.scss'],
})
export class DisclaimerPage implements OnInit {

  disclaimers: any;

  constructor(
    private appService: AppService
  ) { }

  ngOnInit() {
    this.getTextDisclaimer();
  }

  async getTextDisclaimer() {
    try {
      (await this.appService.getTextDisclaimer()).subscribe(data => {
        this.disclaimers = data;
        console.log(this.disclaimers);
      })
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

}
