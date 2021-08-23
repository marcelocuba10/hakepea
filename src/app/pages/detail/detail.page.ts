import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { LoadingController, NavController, Platform } from '@ionic/angular';
import { Post } from '../../models/post.model';
import { ActivatedRoute } from '@angular/router';
import { AppService } from '../../services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Comment } from '../../models/comment.model';
import * as moment from 'moment';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMaps } from '@ionic-native/google-maps';

declare const google;
@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {

  public post = {} as Post;
  public id: any;
  private loading: any;
  public comment = {} as Comment;
  public comments: any;
  private likeOneTime = 0; //btn like o dislike, count one time forEach
  private countLike: number;
  private countDislike: number;
  private driver: number;
  private postSubscription: Subscription;
  private commentSubscription: Subscription;
  private mapRef: any;
  public lat: any;
  public lng: any;
  map: GoogleMaps;

  constructor(
    private appService: AppService,
    private loadingCtrl: LoadingController,
    private actRoute: ActivatedRoute,
    private firestore: AngularFirestore,
    public navCtrl: NavController,
    private geolocation: Geolocation,
    private platform: Platform
  ) {
    this.id = this.actRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {
    console.log("se ejecuta cuando termina de cargar toda la pagina");
    this.getPostById(this.id);
    this.getCommentById();
    this.driver = Math.floor(Math.random() * 999) + 50; //get number random
    this.platform.ready();
  }

  //ejecuta cada vez que la visite la pagina
  ionViewWillEnter() {
    console.log("ejecuta cada vez que la visite la pagina, antes que cargue");
    this.loadmap();
    this.initMap();
  }

 

 initMap(): void {
  this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
    center: { lat: -34.397, lng: 150.644 },
    zoom: 8,
  });
}

  async getPostById(id: string) {
    //show loading
    await this.presentLoading();

    try {
      this.postSubscription = (await this.appService.getPostById(this.id)).valueChanges().subscribe(
        data => {
          this.post.detail = data["detail"];
          this.post.category = data["category"];
          this.post.date = data["date"];
          this.post.imgpath = data["imgpath"];
          this.post.liked = data["liked"];
          this.post.disliked = data["disliked"];
          this.countLike = this.post.liked * 0.1;
          this.countDislike = this.post.disliked * 0.1;
          this.lat = data["lat"];
          this.lng = data["lng"];
          console.log(this.post);
          console.log(this.lat);
          console.log(this.lng);
        }
      );
      // //dismiss loading
      this.loading.dismiss();
    } catch (error) {
      this.appService.presentToast(error);
    }

    if (!this.lat && !this.lng) {
      console.log("lat y lng vacios aun");
      console.log(this.lat);
      console.log(this.lng);
      this.getPostById(id);
    } else {
      console.log("lat y lng no vacios");
      this.loadmap();
    }
  }

  async loadmap() {
    //show loading
    const loading = await this.loadingCtrl.create();
    loading.present();

    //show location in map
    const mapEle: HTMLElement = document.getElementById('map');

    // //crear mapa
    this.mapRef = new google.maps.Map(mapEle, {
      center: { lat: this.lat, lng: this.lng },
      zoom: 18,
      mapTypeId: 'roadmap'
    });

    google.maps.event.addListenerOnce(this.mapRef, 'idle', () => {
      loading.dismiss();
      this.addMarker(this.lat, this.lng);
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
        lat: this.lat, lng: this.lng
      },
      map: this.mapRef,
      title: 'hello world!',
      snippet: 'This plugin is awesome!',
    });
  }

  async CreateComment(comment: Comment) {

    if (this.formValidation()) {

      //show loading
      await this.presentLoading();

      try {
        this.comment.date = moment().locale('es').format('dddd, D MMMM, h:mm a');
        this.comment.timestamp = Date.now();
        this.comment.driver = Math.floor(Math.random() * 999) + 50
        this.comment.idPost = this.id;
        await this.firestore.collection("comments").add(comment);
      } catch (error) {
        this.appService.presentToast(error);
        console.log(error);
      }
      this.loading.dismiss();
      //clear input
      this.clearFieldComment()
    }
  }

  share() {
    this.appService.presentAlert("funcion no habilitada");
  }

  async getCommentById() {

    try {
      this.commentSubscription = this.firestore.collection("comments", ref => ref.where("idPost", "==", this.id).orderBy("timestamp", "desc")).snapshotChanges().subscribe(
        data => {
          this.comments = data.map(e => {
            return {
              id: e.payload.doc.id,
              comment: e.payload.doc.data()["comment"],
              date: e.payload.doc.data()["date"],
              driver: e.payload.doc.data()["driver"],
              idPost: e.payload.doc.data()["idPost"],
            };
          });
        });
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  async increaseProgressUp() {

    if (this.likeOneTime == 0) {
      this.likeOneTime = 1;
      this.post.liked += 1;

      try {
        await this.firestore.doc("posts/" + this.id).update(this.post);
      } catch (error) {
        this.appService.presentToast(error);
      }

    } else if (this.likeOneTime == 1) {
      this.post.liked -= 1;
      this.likeOneTime = 0;
      try {
        await this.firestore.doc("posts/" + this.id).update(this.post);
      } catch (error) {
        this.appService.presentToast(error);
        console.log(error);
      }
    }
  }

  async increaseProgressDown() {

    if (this.likeOneTime == 0) {
      this.likeOneTime = 2;
      this.post.disliked += 1;
      try {
        await this.firestore.doc("posts/" + this.id).update(this.post);
      } catch (error) {
        this.appService.presentToast(error);
        console.log(error);
      }

    } else if (this.likeOneTime == 2) {
      this.post.disliked -= 1;
      this.likeOneTime = 0;
      try {
        await this.firestore.doc("posts/" + this.id).update(this.post);
      } catch (error) {
        this.appService.presentToast(error);
        console.log(error);
      }
    }
  }

  formValidation() {

    if (!this.comment.comment) {
      this.appService.presentToast("Ingrese comentario");
      return false;
    }
    return true;

  }

  OnClick(category) {

    this.post.category = category.name;
    this.post.imgpath = category.imgpath;

  }

  goBack() {
    this.navCtrl.navigateRoot('home');
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

  async presentLoading() {

    this.loading = await this.loadingCtrl.create({
      message: "Por favor, espere.."
    });
    return this.loading.present();

  }

  clearFieldComment() {

    this.comment.comment = '';

  }

}
