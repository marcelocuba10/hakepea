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
  user = {} as User  //{} es un objeto vacio

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

      //show loading
      let loading = await this.loadingCtrl.create({
        message: 'Please wait..'
      });

      await loading.present();

      try {

        await this.appService.login(this.user);

      } catch (error) {

        let message: string;
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'Email ya en uso';
            break;

          case 'auth/invalid-email':
            message = 'Email invalido';
            break;

          case 'auth/argument-error':
            message = 'Rellenar los campos correctamente';
            break;

          case 'auth/weak-password':
            message = 'La contraseña debe tener 6 caracteres o más.';
            break;

          default:
            break;
        }

        this.appService.presentToast(message);
      }

      await loading.dismiss();
    }
  }

  async formValidationUser() {
    await this.appService.formValidationUser(this.user)
  }

}
