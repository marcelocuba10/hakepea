import { Subscription } from 'rxjs';
import { Component, OnInit, ViewChild, AfterContentInit, ElementRef } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { Post } from '../../models/post.model';
import { ActivatedRoute, Routes } from '@angular/router';
import { AppService } from '../../services/app.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Comment } from '../../models/comment.model';
import * as moment from 'moment';
import { Geolocation } from '@capacitor/core';

// import { Geolocation } from '@ionic-native/geolocation/ngx';
// import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';

declare var google;

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



  //maps
  latitude: number;
  longitude: number;

  // @ViewChild('map', { static: true }) mapElement: ElementRef;
  // map: any;
  // address: string;

  // loadMap() {
  //   // create a new map by passing HTMLElement
  //   const mapEle: HTMLElement = document.getElementById('map');
  //   // create LatLng object
  //   const myLatLng = {lat: -25.4055935, lng: -54.644789100000004};
  //   // create map
  //   this.map = new google.maps.Map(mapEle, {
  //     center: myLatLng,
  //     zoom: 12
  //   });
  
  //   google.maps.event.addListenerOnce(this.map, 'idle', () => {
  //     //this.renderMarkers();
  //     mapEle.classList.add('show-map');
  //   });
  // }

  constructor(
    private appService: AppService,
    private loadingCtrl: LoadingController,
    private actRoute: ActivatedRoute,
    private firestore: AngularFirestore,
    public navCtrl:NavController,
    //private geolocation: Geolocation,
    //private nativeGeocoder: NativeGeocoder
  ) {
    this.id = this.actRoute.snapshot.paramMap.get("id");
  }

  ngOnInit() {

    this.getPostById(this.id);
    this.getCommentById();
    this.driver = Math.floor(Math.random() * 999) + 50; //get number random
    // this.loadMap();
    this.getLocation();
  }

  goBack() {
    this.navCtrl.navigateRoot('home');
  }

  async getLocation() {
    const position = await Geolocation.getCurrentPosition();
    this.latitude = position.coords.latitude;
    this.longitude = position.coords.longitude;
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

  share(){
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
          console.log(this.post);
        }
      );

      // //dismiss loading
      this.loading.dismiss();

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
