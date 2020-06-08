import { Component, OnInit } from '@angular/core';

import { User } from '../../models/user.model';
import { LoadingController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  user = {} as User

  constructor(
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private appService: AppService,
    private afAuth: AngularFireAuth
  ) { }

  ngOnInit() {
  }

  async login(user: User) {
    if (this.formValidationUser()) {

      //show loader
      let loader = await this.loadingCtrl.create({
        message: "Please wait..."
      });

      await loader.present();

      try {
        await this.afAuth.signInWithEmailAndPassword(user.email,user.password)
          .then(data => {
            console.log(data);

            this.navCtrl.navigateRoot("tabs");
          })

      } catch (error) {
        this.appService.showToast(error);
      }

      await loader.dismiss();
    }
  }

  formValidationUser() {
    if (!this.user.email) {
      this.appService.showToast("Enter email");
      return false;
    }

    if (!this.user.password) {
      this.appService.showToast("Enter password");
      return false;
    }

    return true;
  }

}
