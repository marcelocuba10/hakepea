import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Post } from '../../models/post.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.page.html',
  styleUrls: ['./edit-post.page.scss'],
})
export class EditPostPage implements OnInit {
  post = {} as Post;
  id: any;

  constructor(
    private appService: AppService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private actRoute: ActivatedRoute,
    private alertCtrl: AlertController
  ) {
    this.id = this.actRoute.snapshot.paramMap.get("id"); //captura el ID
  }

  ngOnInit() {
    this.getPostById(this.id);
  }

  async getPostById(id: string) {
    //show loading
    let loading = await this.loadingCtrl.create({
      message: "Por favor espere..."
    });

    await loading.present();
    try {

      this.firestore.doc("posts/" + id).valueChanges().subscribe(data => {
        this.post.detail = data["detail"];
        this.post.category = data["category"];
        this.post.date = data["date"];
        this.post.imgpath = data["imgpath"];
      });

      //dismiss loading
      await loading.dismiss();

    } catch (error) {
      this.appService.showToast(error);
    }
  }

  async updatePost(post: Post) {
    if (this.formValidation()) {  //formValidation devuelve , true o false
      //show loading
      let loading = await this.loadingCtrl.create({
        message: "Por favor espere..."
      });

      await loading.present();

      try {
        await this.firestore.doc("posts/" + this.id).update(post);
      } catch (error) {
        this.appService.showToast(error);
        console.log(error);
      }

      //dismiss loading
      await loading.dismiss();
      //redirect to home
      this.navCtrl.navigateRoot("admin");
    }
  }

  async presentAlertConfirm(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Desea eliminar este aviso?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            console.log('Confirm Okay');
            this.appService.deletePost(this.id);
            this.navCtrl.navigateRoot('admin');
          }
        }
      ]
    });

    await alert.present();
  }

  formValidation() {
    if (!this.post.detail) {
      this.appService.presentToast("Ingrese una descripción");
      return false;
    } else {
      return true;
    }
  }

  categories = [
    {
      name: 'Caminera',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpolicia_caminera250x200.png?alt=media&token=9d0f5e6b-4192-46f4-a01a-5ddfd42b55f7',
      color: 'success',
      fill: 'outline',
      selected: 'solid'
    },
    {
      name: 'Nacional',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpolicia_nacional250x200.png?alt=media&token=64ff8de0-b0aa-4e13-bdb9-596165df0b0e',
      color: 'warning',
      fill: 'outline'
    },
    {
      name: 'Municipal',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpolicia_municipal250x200.png?alt=media&token=2430748c-6d77-4b04-82df-7d8fe3351904',
      color: 'default',
      fill: 'outline'
    },
    {
      name: 'Trafico',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Ftrafico250x200.png?alt=media&token=886382a4-8e33-4a2e-a079-916943c5e16b',
      color: 'danger',
      fill: 'outline'
    },
    {
      name: 'Accidente',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Faccidente250x200.png?alt=media&token=e5b7e7ca-d4a6-4dce-9eb3-6084f19a6506',
      color: 'default',
      fill: 'outline'
    },
    {
      name: 'Obras',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fobras250x200.png?alt=media&token=55d3b049-afba-4df9-b4b5-d65056a5c572',
      color: 'success',
      fill: 'outline'
    }
  ];

  OnClick(category) {
    this.post.category = category.name;
    this.post.imgpath = category.imgpath;
  }

}
