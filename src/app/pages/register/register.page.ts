import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  user = {} as User;

  constructor(
    private loadingCtrl: LoadingController,
    private appService: AppService
  ) { }

  ngOnInit() {
  }

  async register() {

    if (this.formValidationUser()) {

      //show loading
      let loading = await this.loadingCtrl.create({
        message:'Please wait..'
      });

      await loading.present();

      try {

        await this.appService.register(this.user);

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
