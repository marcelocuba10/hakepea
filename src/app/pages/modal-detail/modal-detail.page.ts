import { Comment } from './../../models/comment.model';
import { Subscription } from 'rxjs';
import { Post } from 'src/app/models/post.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { AppService } from 'src/app/services/app.service';
import { ModalController, LoadingController, NavController, AlertController } from '@ionic/angular';
import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-modal-detail',
  templateUrl: './modal-detail.page.html',
  styleUrls: ['./modal-detail.page.scss'],
})
export class ModalDetailPage implements OnInit {

  @Input() id: string;

  public post = {} as Post;
  private loading: any;
  public comment = {} as Comment;
  public comments: any= null;
  private likeOneTime = 0; //btn like o dislike, count one time forEach
  private countLike: number;
  private countDislike: number;
  private postSubscription: Subscription;
  private commentSubscription: Subscription;

  public driverNumber = Math.floor(Math.random() * 999) + 50;
  public dateComment = moment().locale('es').format('dddd, D MMMM, h:mm a');

  constructor(
    private modalCtrl: ModalController,
    private appService: AppService,
    private loadingCtrl: LoadingController,
    private firestore: AngularFirestore,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) { }
  

   ngOnInit() {
    this.getPostById(this.id);
    this.getCommentById();
  }

  ionViewWillEnter (){
    //this.getCommentById();
    
  }

  ionViewDidEnter (){
    this.getCommentById();
  }

  ionViewDidLeave() {
    this.comments=null;
  }


    async testecom(data : any){

      const xx=data.length; 


    if(xx===0){
      console.log("no comments" + xx);
      this.CreateCommentInitial();
    }else{
      console.log("yes, comments"+ xx);
    }

    }


  showMapWithMarkers() {
    //redirect to home
    this.navCtrl.navigateRoot("location");
    this.dismissModal();
  }

  dismissModal() {
    this.modalCtrl.dismiss({
      'dismissed': true
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
          console.log(this.post);
        }
      );
      // //dismiss loading
      this.loading.dismiss();
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      message: "Por favor, espere.."
    });
    return this.loading.present();
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

         this.testecom(this.comments);
    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  async CreateComment(comment: Comment) {

    if (this.formValidation()) {

      //show loading
      await this.presentLoading();

      try {
        this.comment.date = moment().locale('es').format('dddd, D MMMM, h:mm a');
        this.comment.timestamp = Date.now();
        this.comment.idPost = this.id;
        this.comment.driver=this.driverNumber;
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

  async CreateCommentInitial() {
      try {
        this.comment.comment="Gracias por tu aviso!";
        this.comment.date = moment().locale('es').format('dddd, D MMMM, h:mm a');
        this.comment.timestamp = Date.now();
        this.comment.idPost = this.id;
        this.comment.driver=this.driverNumber;
        await this.firestore.collection("comments").add(this.comment);
      } catch (error) {
        this.appService.presentToast(error);
        console.log(error);
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

  clearFieldComment() {
    this.comment.comment = '';
  }

  ngOnDestroy() {
    this.commentSubscription.unsubscribe();
    this.postSubscription.unsubscribe();
  }

}
