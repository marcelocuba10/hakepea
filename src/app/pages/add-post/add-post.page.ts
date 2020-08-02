import { Component, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Post } from '../../models/post.model';
import { AppService } from 'src/app/services/app.service';
import { LoadingController, NavController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements OnInit {
  post = {} as Post;

  constructor(
    private appService: AppService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private firestore: AngularFirestore
  ) { }

  ngOnInit() {
  }

  async createPost(post: Post) {
    if (this.formValidation()) {
      //show loading
      let loading = await this.loadingCtrl.create({
        message: "Por favor, espere.."
      });

      await loading.present();

      try {
        this.post.date = moment().lang('es').format('dddd, D MMMM, h:mm a'); 
        this.post.timestamp = Date.now();
        this.post.liked = 1;
        this.post.disliked = 0;

        await this.firestore.collection("posts").add(post);

      } catch (error) {
        this.appService.presentToast(error);
      }

      await loading.dismiss();

      //redirect to home
      this.navCtrl.navigateRoot("tabs");
      this.clearInputs();
    }
  }

  clearInputs() {
    this.post.detail = '';
    this.post.category = '';
    this.post.date = '';
    this.post.imgpath = '';
  }

  formValidation() {
    if (!this.post.detail) {
      this.appService.presentToast("Ingrese contenido al aviso");
      return false;
    }

    if (!this.post.category) {
      this.appService.presentToast("Seleccione una categoría");
      return false;
    }

    return true;

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
    //pasamos la categoria selecionada al objeto post.categoria
    switch (category.name) {
      case category.name = "Caminera":
        this.post.category = "Policía Caminera";
        break;
      case category.name = "Nacional":
        this.post.category = "Policía Nacional"
        break;
      case category.name = "Municipal":
        this.post.category = "Policía Municipal"
        break;
      case category.name = "Trafico":
        this.post.category = category.name;
        break;
      case category.name = "Accidente":
        this.post.category = "Accidente de Tránsito";
        break;
      case category.name = "Obras":
        this.post.category = "Obras de Construcción";
        break;
      default:
        break;
    }
    this.post.imgpath = category.imgpath;
  }

}
