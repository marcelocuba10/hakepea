import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Post } from '../../models/post.model';
import { AppService } from 'src/app/services/app.service';
import { NavController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  ILatLng,
  Marker,
  BaseArrayClass
} from '@ionic-native/google-maps';

declare const google;

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements OnInit {
  post = {} as Post;
  mapRef: any;
  map: GoogleMap;

  constructor(
    private appService: AppService,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private alertCtrl: AlertController,
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.loadmap();
  }

  async loadmap() {
    //show loading
     const loading = await this.loadingCtrl.create();
     loading.present();

    const myLatLng = await this.getLocation();
    console.log(myLatLng);
    const mapEle: HTMLElement = document.getElementById('map');

    // //crear mapa
    this.mapRef = new google.maps.Map(mapEle, {
      center: { lat: myLatLng.lat, lng: myLatLng.lng },
      zoom: 18,
      mapTypeId: 'roadmap'
    });

    google.maps.event.addListenerOnce(this.mapRef, 'idle', () => {
      loading.dismiss();
      this.addMarker(myLatLng.lat, myLatLng.lng);
    });
  }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    return {
      lat: rta.coords.latitude,
      lng: rta.coords.longitude
    };
  }

  private addMarker(lat: number, lng: number) {
    const marker = new google.maps.Marker({
      position: {
        lat, lng
      },
      map: this.mapRef,
      title: 'hello world!'
    });
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
      name: 'Policia',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpolice-icon-80x80%20(1).png?alt=media&token=80caac4b-25f2-491d-9c59-8ee60a15dd41',
      color: 'success',
      fill: 'outline',
      selected: 'solid'
    },
    {
      name: 'Trafico',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Ftrafico250x200.png?alt=media&token=886382a4-8e33-4a2e-a079-916943c5e16b',
      color: 'danger',
      fill: 'outline'
    },
    {
      name: 'Accidente',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fcrash-car-icon-80x80%20(1).png?alt=media&token=ef948cd5-07e0-43a5-892e-c3042b4f0a3b',
      color: 'default',
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
