import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  public myLatLng: any;
  toggleValue: boolean = true;
  public borderColor: any;
  public btnSelected: any;

  address: string;
  placeid: any;

  public latitude: number;
  public longitude: number;

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
    this.getAddressFromCoords(this.myLatLng);
  }

  //ejecuta cuando cada vez que salimos de la pagina
  ionViewWillLeave() {
    this.btnSelected = null;
  }

  getAddressFromCoords(myLatLng) {
    console.log("getAddressFromCoords " + myLatLng.lat + " " + myLatLng.lng);
    let options: NativeGeocoderOptions = {
      useLocale: true,
      maxResults: 5
    };

    this.nativeGeocoder.reverseGeocode(myLatLng.lat, myLatLng.lng, options)
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
        this.address = "Dirección no disponible";
      });
  }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    return {
      lat: rta.coords.latitude,
      lng: rta.coords.longitude
    };
  }

  async createPost(post: Post) {
    this.appService.presentLoading(1);
    try {
      this.post.address = this.address;
      this.post.time = moment().locale('es').format('LT');
      this.post.timestamp = Date.now();
      this.post.liked = 1;
      this.post.views = 1;
      this.post.disliked = 0;

      if (this.toggleValue == true) {
        //save lat and lng in model post
        this.post.lat = this.myLatLng.lat;
        this.post.lng = this.myLatLng.lng;
      } else {
        this.post.lat = null;
        this.post.lng = null;
      }

      if (!this.post.detail) {
        this.post.detail = "Sin información";
      }

      //save data in firestore
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
        mode: 'ios',
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
    this.post.time = '';
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

}
