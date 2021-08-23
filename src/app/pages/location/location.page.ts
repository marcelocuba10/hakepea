
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

      // marker.addListener('click', function () {
      //   //show message
      //   //this.appService.presentAlert("info");
      //   infowindow.open(this.map, marker);
      // }); 

      // const contentString = '<div id="content">' +
      //   '<div id="siteNotice">' +
      //   '</div>' +
      //   '<h1 id="firstHeading" class="firstHeading">' + post.category + '</h1>' +
      //   '<div id="bodyContent">' +
      //   '<img center style="width: min-content;" src="https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpolice-icon-80x80%20(1).png?alt=media&token=80caac4b-25f2-491d-9c59-8ee60a15dd41" width="200">' +
      //   '<p><b>Categoría: </b>' + post.category + '</p>' +
      //   '<p><b>Fecha: </b>' + post.date + '</p>' +
      //   '<p><b>Descripción: </b>' + post.detail + '</p>' +
      //   '<p><b>Me gusta: </b>' + post.liked + '</p>' +
      //   '<p><b>No me gusta: </b>' + post.disliked + '</p>' +
      //   '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
      //   'https://en.wikipedia.org/w/index.php?title=Uluru</a> ' +
      //   '(last visited June 22, 2009).</p>' +
      //   '</div>' +
      //   '</div>';

      // const infowindow = new google.maps.InfoWindow({
      //   content: contentString,
      //   maxWidth: 400
      // });

    });
  }

  async showInfoMarker(post: Post) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: post.category,
      subHeader: post.detail,
      message: post.date,
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
              imgpathMarker: e.payload.doc.data()["imgpathMarker"],
              date: e.payload.doc.data()["date"],
              lat: e.payload.doc.data()["lat"],
              lng: e.payload.doc.data()["lng"],
            };
          });
        });
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  ngOnDestroy() {
    this.postSubscription.unsubscribe();
  }

}
