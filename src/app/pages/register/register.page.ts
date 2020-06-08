import { Component, OnInit } from '@angular/core';
import { ToastController, LoadingController, NavController } from '@ionic/angular';
import { AppService } from 'src/app/services/app.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {User} from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  user = {} as User;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private appService:AppService
  ) { }

  ngOnInit() {
  }

  async register(user: User) {
    if (this.formValidation()) {
      //show loader
      let loader = await this.loadingCtrl.create({ // Let tiene un alcance en el bloque de cierre inmediato denotado por {} 
        message: "Please Wait"
      });
      await loader.present(); //await obliga a que la sincronizacion se ejecute antes de seguir con el proceso

      try {
        await this.afAuth.createUserWithEmailAndPassword(user.email, user.password)
          .then(data => {
            console.log(data);

            //redirect   to home
            this.navCtrl.navigateRoot("home");
          }
          );
      } catch (error) {
        this.appService.showToast(error);
      }

      // dismiss loader
      await loader.dismiss();
    }
  }

  formValidation() {
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
