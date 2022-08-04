import { Component, OnInit } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
})
export class AboutPage implements OnInit {
  texts: any;

  constructor(
    private appService: AppService
  ) { }

  ngOnInit() {
    this.getTextInfos();
  }

  async getTextInfos() {
    try {
      (await this.appService.getTextInfos()).subscribe(data => {
        this.texts = data;
        console.log(this.texts);
      })
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  async openLink(Url){
    window.open(Url, '_system' , 'location=no');  
  }

}
