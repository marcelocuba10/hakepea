import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user.model';
import { LoadingController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public user = {} as User;
  private loading: any;

  constructor(
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private appService: AppService,
    private authservice: AuthService
  ) { }

  ngOnInit() {
  }

  async login(user: User) {

    if (await this.formValidationUser()) {

      //show loading
      await this.presentLoading();

      try {
        await this.authservice.login(this.user);
        if (this.user) {
          this.navCtrl.navigateRoot('admin');
        }

      } catch (error) {

        let message: string;
        switch (error.code) {
          
          case 'auth/email-already-in-use':
            message = 'Email ya en uso';
            console.log('ingreso en el switch');
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
            console.log('ingreso en el switch');
            break;

          case 'auth/user-not-found':
            message = 'Usuario no encontrado.';
            break;

          default:
            break;
        }

        this.appService.presentToast(message);
      }

      this.loading.dismiss();
    }
    
  }

  async formValidationUser() {

    if (!this.user.email) {
      this.appService.presentAlert("Ingrese email");
      return false;
    }

    if (!this.user.password) {
      this.appService.presentAlert("Ingrese contraseña");
      return false;
    }

    return true;

  }

  async presentLoading() {

    this.loading = await this.loadingCtrl.create({
      message: "Por favor, espere.."
    });
    return this.loading.present();

  }

}
