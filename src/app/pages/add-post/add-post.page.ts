import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { Post } from '../../models/post.model';
import { AppService } from 'src/app/services/app.service';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Geolocation } from '@ionic-native/geolocation/ngx';

declare const google;
@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements OnInit {
  post = {} as Post;
  mapRef: any;
  public myLatLng: any;
  toggleValue: boolean = true;
  private lat: number;
  private lng: number;

  constructor(
    private appService: AppService,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private alertCtrl: AlertController,
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController,
  ) { }

  async ngOnInit() {
    this.myLatLng = await this.getLocation();
  }

  // async loadmap() {
  //   //show loading
  //   const loading = await this.loadingCtrl.create();
  //   loading.present();

  //   if (!this.myLatLng) {
  //     //run first time getlocation
  //     this.myLatLng = await this.getLocation();
  //   }

  //   console.log(this.myLatLng);

  //   //save lat and lng in model post
  //   this.post.lat = this.myLatLng.lat;
  //   this.post.lng = this.myLatLng.lng;

  //   //show location in map
  //   const mapEle: HTMLElement = document.getElementById('map');

  //   // //crear mapa
  //   this.mapRef = new google.maps.Map(mapEle, {
  //     center: { lat: this.myLatLng.lat, lng: this.myLatLng.lng },
  //     zoom: 18,
  //     mapTypeId: 'roadmap'
  //   });

  //   google.maps.event.addListenerOnce(this.mapRef, 'idle', () => {
  //     loading.dismiss();
  //     this.addMarker(this.myLatLng.lat, this.myLatLng.lng);
  //   });
  // }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    return {
      lat: rta.coords.latitude,
      lng: rta.coords.longitude
    };
  }

  // private addMarker(lat: number, lng: number) {
  //   const marker = new google.maps.Marker({
  //     position: {
  //       lat, lng
  //     },
  //     map: this.mapRef,
  //     title: 'hello world!',
  //     snippet: 'This plugin is awesome!',
  //   });
  // }

  async createPost(post: Post) {
    this.appService.presentLoading(1);
    try {
      this.post.date = moment().locale('es').format('dddd, D MMMM, h:mm a');
      this.post.timestamp = Date.now();
      this.post.liked = 1;
      this.post.disliked = 0;

      if (this.toggleValue == true) {
        //save lat and lng in model post
        this.post.lat = this.myLatLng.lat;
        this.post.lng = this.myLatLng.lng;

        console.log(this.post.lat);
        console.log(this.post.lng);
      }else{
        this.post.lat = null;
        this.post.lng = null;

        console.log(this.post.lat);
        console.log(this.post.lng);
      }

      //save post in firestore
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
        message: 'Si envías falsos avisos, puede que te quitemos el acceso a la aplicación. Enviar aviso?',
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
      imgpathMarker: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/maps%2Ficon-marker-police1.png?alt=media&token=ce25aac6-752c-4b30-9613-c8f9c6f9edbb',
      color: 'default',
      fill: 'outline',
      selected: 'solid'
    },
    {
      name: 'Trafico',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/maps%2Ftrafico-icon-80x80.png?alt=media&token=cd29c6ef-e937-412f-a788-071e4278e258',
      imgpathMarker: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/maps%2Ficon-marker-police1.png?alt=media&token=ce25aac6-752c-4b30-9613-c8f9c6f9edbb',
      color: 'warning',
      fill: 'outline'
    },
    {
      name: 'Accidente',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/maps%2Faccident-icon-80x80%20(1).png?alt=media&token=a9365128-af1f-4236-95c7-49705a7c4d80',
      imgpathMarker: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/maps%2Ficon-marker-accident-100x150%20(2).png?alt=media&token=3fbf4731-9101-4944-822f-2683e1350310',
      color: 'success',
      fill: 'outline'
    }
  ];

  //pasamos el nombre personalizado de la categoria y la imagen al Model
  OnClick(category) {
    switch (category.name) {
      case category.name = "Policia":
        this.post.category = "Control Policial";
        break;
      case category.name = "Trafico":
        this.post.category = "Trafico Vehicular";
        break;
      case category.name = "Accidente":
        this.post.category = "Accidente de Tránsito";
        break;
      default:
        break;
    }
    //pasamos las imagenes
    this.post.imgpath = category.imgpath;
    this.post.imgpathMarker = category.imgpathMarker;
  }

}
