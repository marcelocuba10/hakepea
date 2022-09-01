
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform, LoadingController, AlertController, NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/models/post.model';
import { AppService } from 'src/app/services/app.service';
import { GoogleMap } from "@ionic-native/google-maps";

declare const google;
@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {

  mapRef: any;
  map = GoogleMap;
  public posts: any;
  public postList: []; //search function
  private postSubscription: Subscription;
  public myLatLng: any;

  constructor(
    private platform: Platform,
    private geolocation: Geolocation,
    private loadingCtrl: LoadingController,
    private appService: AppService,
    private firestore: AngularFirestore,
    public alertController: AlertController,
    public nav: NavController
  ) { }

  //cuando termina de cargar toda la pagina
  async ngOnInit() {
    console.log("se ejecuta cuando termina de cargar toda la pagina");
    await this.platform.ready();
  }

  //ejecuta cada vez que la visite la pagina
  ionViewWillEnter() {
    console.log("ejecuta cada vez que la visite la pagina, antes que cargue");
    this.showMap();
    this.getPosts();
  }

  //ejecuta cuando cada vez que salimos de la pagina
  ionViewWillLeave() {
  }

  async showMap() {
    //show loading
    const loading = await this.loadingCtrl.create();
    loading.present();

    if (!this.myLatLng) {
      //run first time getlocation
      this.myLatLng = await this.getLocation();
    }

    // create a new map by passing HTMLElement div
    const mapEle: HTMLElement = document.getElementById('map');

    // //crear mapa con la posicion actual
    this.map = new google.maps.Map(mapEle, {
      center: { lat: this.myLatLng.lat, lng: this.myLatLng.lng },
      zoom: 12,
      mapTypeId: 'roadmap'
    });

    //evento que se ejecuta cuando carga el mapa por completo
    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      loading.dismiss();
      console.log('Map is ready!');
      //get markers for map
      this.renderMarkers(this.posts);
    });
  }

  private async getLocation() {
    const rta = await this.geolocation.getCurrentPosition();
    return {
      lat: rta.coords.latitude,
      lng: rta.coords.longitude
    };
  }

  async getPosts() {
    try {
      this.postSubscription = this.firestore.collection("posts", ref => ref.orderBy("timestamp", "desc")).snapshotChanges().subscribe(
        data => {
          this.posts = data.map(e => {
            return {
              id: e.payload.doc.id,
              detail: e.payload.doc.data()["detail"],
              category: e.payload.doc.data()["category"],
              address: e.payload.doc.data()["address"],
              imgpathMarker: e.payload.doc.data()["imgpathMarker"],
              time: e.payload.doc.data()["time"],
              lat: e.payload.doc.data()["lat"],
              lng: e.payload.doc.data()["lng"],
            };
          });
        });
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  renderMarkers(post: Post) {
    if (!post) {
      console.log("post vacio");
      //volvemos a llamar a la funcion showmap
      this.showMap();
    }

    //procesamos cada marker
    this.posts.forEach(post => {
      //traemos el marker
      const marker = this.addMarker(post);

      if (!marker) {
        console.log("marker is null, skip");
        return
      } else {
        console.log("marker found, get marker");
        google.maps.event.addListener(marker, 'click', () => {
          //infoWindow.open(this.map, marker);
          this.showInfoMarker(post);
        });
      }
    });
  }

  async showInfoMarker(post: Post) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      mode: 'ios',
      header: post.category + " - " + post.time,
      subHeader: post.detail,
      message: post.address,
      buttons: ['OK']
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  addMarker(post: Post) {
    if (!post.lat || !post.lng) {
      return;
    } else {
      return new google.maps.Marker({
        position: {
          lat: post.lat, lng: post.lng
        },
        animation: 'DROP',
        map: this.map,
        title: post.category,
        icon: {
          url: post.imgpathMarker,
          scaledSize: new google.maps.Size(50, 50)
        }
      });
    }
  }

  ngOnDestroy() {
    this.postSubscription.unsubscribe();
  }

}
