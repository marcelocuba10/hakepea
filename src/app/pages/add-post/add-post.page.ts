import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Post } from '../../models/post.model';
import { AppService } from 'src/app/services/app.service';
import { NavController, AlertController } from '@ionic/angular';
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
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  async createPost(post: Post) {
    this.appService.presentLoading(1);
    try {
      this.post.date = moment().locale('es').format('dddd, D MMMM, h:mm a');
      this.post.timestamp = Date.now();
      this.post.liked = 1;
      this.post.disliked = 0;

      await this.firestore.collection("posts").add(post);
      this.appService.presentLoading(0);

    } catch (error) {
      this.appService.presentToast(error);
      this.appService.presentLoading(0);
      console.log(error);
    }

    this.appService.presentLoading(0);

    //redirect to home
    this.navCtrl.navigateRoot("home");
    this.clearInputs();

  }

  async presentAlertConfirm(post: Post) {
    if (await this.appService.formValidation(post, "post")) {
      const alert = await this.alertCtrl.create({
        header: 'Atención',
        message: 'Enviar falsos avisos puede ocasionar que seas bloqueado de la aplicación. Estás seguro de que el aviso es correcto?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Sí, enviar',
            handler: () => {
              console.log('Confirm Okay');
              this.createPost(this.post);
            }
          }
        ]
      });
      await alert.present();
    }
  }

  clearInputs() {
    this.post.detail = '';
    this.post.category = '';
    this.post.date = '';
    this.post.imgpath = '';
  }


  categories = [
    {
      name: 'Caminera',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Ficon-police-hakepea2.jpg?alt=media&token=3c499b17-e165-48c2-a4a5-137d49738dab',
      color: 'success',
      fill: 'outline',
      selected: 'solid'
    },
    {
      name: 'Nacional',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Ficon-police-hakepea2.jpg?alt=media&token=3c499b17-e165-48c2-a4a5-137d49738dab',
      color: 'warning',
      fill: 'outline'
    },
    {
      name: 'Municipal',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Ficon-police-hakepea2.jpg?alt=media&token=3c499b17-e165-48c2-a4a5-137d49738dab',
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
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpngtree-prohibit-warning-icon-image_129740.jpg?alt=media&token=5669f436-7eb8-436a-a64d-d3e1a2ae8c18',
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
