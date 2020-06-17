import { Component, OnInit } from '@angular/core';

import { User } from '../../models/user.model';
import { LoadingController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from 'src/app/services/auth.service';

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
    private authservice: AuthService
  ) { }

  ngOnInit() {
  }

  async login(user: User) {
    if (this.formValidationUser()) {

      //show loading
      let loading = await this.loadingCtrl.create({
        message: 'Por favor, aguarde..'
      });
      await loading.present();

      try {
        await this.authservice.login(this.user);
        if (this.user) {
          console.log('Logged in!');
          this.navCtrl.navigateRoot('admin');
        }

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

          case 'auth/wrong-password':
            message = 'La contraseña es incorrecta';
            break;

          case 'auth/user-not-found':
            message = 'Usuario no encontrado.';
            break;

          default:
            break;
        }

        this.appService.presentToast(message);
        console.log(error);
      }

      await loading.dismiss();
    }
  }

  async formValidationUser() {
    await this.appService.formValidationUser(this.user)
  }

}
