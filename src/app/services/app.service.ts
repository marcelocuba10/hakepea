import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(
    private toastCtrl:ToastController

  ) { }

  showToast(message:string){
    this.toastCtrl.create({
      message:message,
      duration:3000
    }).then(toastData => toastData.present());
  }
}
