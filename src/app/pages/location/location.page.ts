import { AngularFirestore } from '@angular/fire/firestore';
import { AppService } from './../../services/app.service';
import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Platform, LoadingController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/models/post.model';

declare const google;

interface Marker {
  position: {
    lat: number,
    lng: number,
  };
  title: string;
}

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit{

  mapRef: any;
  map = null;
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
  ) { }


  //cuando termina de cargar toda la pagina
  ngOnInit() {
    console.log("se ejecuta cuando termina de cargar toda la pagina");
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

  // async presentAlert() {
  //   const alert = await this.alertController.create({
  //     cssClass: 'my-custom-class',
  //     header: 'Alert',
  //     subHeader: 'Subtitle',
  //     message: 'This is an alert message.',
  //     buttons: ['OK']
  //   });

  //   await alert.present();

  //   const { role } = await alert.onDidDismiss();
  //   console.log('onDidDismiss resolved with role', role);
  // }


  async showMap() {
    //show loading
    const loading = await this.loadingCtrl.create();
    loading.present();

    if (!this.myLatLng) {
      //run first time getlocation
      this.myLatLng = await this.getLocation();
    }

    // create a new map by passing HTMLElement
    const mapEle: HTMLElement = document.getElementById('map');

    // create map
    this.map = new google.maps.Map(mapEle, {
      center: { lat: this.myLatLng.lat, lng: this.myLatLng.lng },
      zoom: 12,
      mapTypeId: 'roadmap'
    });

    google.maps.event.addListenerOnce(this.map, 'idle', () => {
      loading.dismiss();
      console.log("loadmap");
      this.renderMarkers(this.posts);
    });
  }

  renderMarkers(post: Post) {
    console.log("detail post" + post);
    if (!post) {
      console.log("post vacio");
      this.showMap();
    }
    this.posts.forEach(post => {
      this.addMarker(post);
    });
  }

  addMarker(post: Post) {
    console.log("location: " + post.lat + " - " + post.lng);
    ///console.log("imgPath: " + post.imgpath.toString);

    const contentString = '<div id="content">' +
    '<div id="siteNotice">' +
    '</div>' +
    '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
    '<div id="bodyContent">' +
    '<img src="https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpolice-icon-80x80%20(1).png?alt=media&token=80caac4b-25f2-491d-9c59-8ee60a15dd41" width="200">' +
    '<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large ' +
    'sandstone rock formation in the southern part of the ' +
    'Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) ' +
    'south west of the nearest large town, Alice Springs; 450&#160;km ' +
    '(280&#160;mi) by road. Kata Tjuta and Uluru are the two major ' +
    'features of the Uluru - Kata Tjuta National Park. Uluru is ' +
    'sacred to the Pitjantjatjara and Yankunytjatjara, the ' +
    'Aboriginal people of the area. It has many springs, waterholes, ' +
    'rock caves and ancient paintings. Uluru is listed as a World ' +
    'Heritage Site.</p>' +
    '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
    'https://en.wikipedia.org/w/index.php?title=Uluru</a> ' +
    '(last visited June 22, 2009).</p>' +
    '</div>' +
    '</div>';
    
    const infowindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 400
    });

    // marker.addListener('click', function() {
    //   infowindow.open(this.map, marker);
    // });

    return new google.maps.Marker({
      position: {
        lat: post.lat, lng: post.lng
      },
      map: this.map,
      title: post.category,
      icon: { 
        url: "https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fpolice-icon-80x80%20(1).png?alt=media&token=80caac4b-25f2-491d-9c59-8ee60a15dd41",
        scaledSize: new google.maps.Size(35, 35) 
      }, 
    });
  };


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
              date: e.payload.doc.data()["date"],
              lat: e.payload.doc.data()["lat"],
              lng: e.payload.doc.data()["lng"],
            };
          });
          //this.renderMarkers(this.posts);
        });
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  ngOnDestroy() {
    this.postSubscription.unsubscribe();
  }

}
