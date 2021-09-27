import { Subscription } from 'rxjs';
import { Component, OnInit,ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { Post } from '../../models/post.model';
import { AppService } from 'src/app/services/app.service';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMap } from "@ionic-native/google-maps";
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare const google;
@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.page.html',
  styleUrls: ['./add-post.page.scss'],
})
export class AddPostPage implements OnInit {
  post = {} as Post;
  categories: any;
  private categoriesSubscription: Subscription;
  mapRef: any;
  map : any;
  public myLatLng: any;
  toggleValue: boolean = true;
  public borderColor: any;
  public btnSelected: any;

  address:string;
  placeid: any;

  @ViewChild('map', { static: false }) mapElement: ElementRef;

  latitude: number;
  longitude: number;

  constructor(
    private appService: AppService,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private alertCtrl: AlertController,
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController,
    private nativeGeocoder: NativeGeocoder, 
  ) { }

  async ngOnInit() {
    this.myLatLng = await this.getLocation();
    this.getCategories();
    this.loadMap();
  }

  //ejecuta cuando cada vez que salimos de la pagina
  ionViewWillLeave() {
    this.btnSelected = null;
  }

  private async getLocation() {

    const rta = await this.geolocation.getCurrentPosition();
    return {
      lat: rta.coords.latitude,
      lng: rta.coords.longitude
    };
    
  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      let latLng = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      this.getAddressFromCoords(resp.coords.latitude, resp.coords.longitude);
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.map.addListener('tilesloaded', () => {
        console.log('accuracy',this.map);
        this.getAddressFromCoords(this.map.center.lat(), this.map.center.lng())
      });
    }).catch((error) => {
      console.log('Error getting location', error);
    });
 }

  getAddressFromCoords(lattitude, longitude) {
    console.log("getAddressFromCoords " + lattitude+ " " +longitude);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(lattitude, longitude, options)
      .then((result: NativeGeocoderResult[]) => {
        this.address = "";
        let responseAddress = [];
        for (let [key, value] of Object.entries(result[0])) {
          if (value.length > 0)
            responseAddress.push(value);

        }
        responseAddress.reverse();
        for (let value of responseAddress) {
          this.address += value + ", ";
        }
        this.address = this.address.slice(0, -2);
      })
      .catch((error: any) => {
        this.address = "Address Not Available!";
      });

  }

  async createPost(post: Post) {
    this.appService.presentLoading(1);
    try {
      this.post.date = moment().locale('es').format('LT');
      this.post.timestamp = Date.now();
      this.post.liked = 1;
      this.post.disliked = 0;

      if (this.toggleValue == true) {
        //save lat and lng in model post
        this.post.lat = this.myLatLng.lat;
        this.post.lng = this.myLatLng.lng;

        console.log(this.post.lat);
        console.log(this.post.lng);
      } else {
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

  async getCategories() {
    try {
      (await this.appService.getCategories()).subscribe(data => {
        this.categories = data;
        console.log(this.categories);
      })
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  ngOnDestroy() {
    this.categoriesSubscription.unsubscribe();
  }

  clearInputs() {
    this.post.detail = '';
    this.post.category = '';
    this.post.date = '';
    this.post.imgpath = '';
  }

  //pasamos el nombre personalizado de la categoria y la imagen al Model
  OnClick(category) {
    switch (category.name) {

      case category.name = ".Policía":
        this.post.category = "Puesto Policial";
        this.btnSelected = category.name;
        break;
      case category.name = "Tráfico":
        this.post.category = "Trafico Vehicular";
        this.btnSelected = category.name;
        break;
      case category.name = "Accidente":
        this.post.category = "Accidente de Tránsito";
        this.btnSelected = category.name;
        break;
      case category.name = "Desvío":
        this.post.category = "Desvío";
        this.btnSelected = category.name;
        break;
      case category.name = ".Comentario":
        this.post.category = "Comentario";
        this.btnSelected = category.name;
        break;
      case category.name = ".Radar":
        this.post.category = "Radar en Ruta";
        this.btnSelected = category.name;
        break;
      default:
        break;

    }
    //pasamos las imagenes
    this.post.imgpath = category.imgpath;
    this.post.imgpathMarker = category.imgpathMarker;
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

}
