import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/services/app.service';
import { LoadingController, NavController, AlertController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/firestore';
import { Post } from '../../models/post.model';
import { ActivatedRoute } from '@angular/router';
import { Comment } from '../../models/comment.model';
import * as moment from 'moment';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.page.html',
  styleUrls: ['./edit-post.page.scss'],
})
export class EditPostPage implements OnInit {
  post = {} as Post;
  id: any;

  comment = {} as Comment;
  comments: any;
  likeOneTime = 0; //el boton like o dislike, solo se puede contar una vez
  countLike: number;
  countDislike: number;
  driver: number;

  constructor(
    private appService: AppService,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private actRoute: ActivatedRoute,
    private alertCtrl: AlertController
  ) {
    this.id = this.actRoute.snapshot.paramMap.get("id"); //captura el ID
  }

  ngOnInit() {
    this.getPostById(this.id);
    this.getCommentById();
    this.driver = Math.floor(Math.random() * 999) + 50
  }

  async getPostById(id: string) {
    //show loading
    let loading = await this.loadingCtrl.create({
      message: "Por favor espere..."
    });

    await loading.present();
    try {

      this.firestore.doc("posts/" + id).valueChanges().subscribe(data => {
        this.post.detail = data["detail"];
        this.post.category = data["category"];
        this.post.time = data["time"];
        this.post.imgpath = data["imgpath"];
        this.post.liked = data["liked"];
        this.post.disliked = data["disliked"];
        this.countLike = this.post.liked * 0.1;
        this.countDislike = this.post.disliked * 0.1;
        console.log(this.post);
      });

      //dismiss loading
      await loading.dismiss();

    } catch (error) {
      this.appService.presentToast(error);
    }
  }

  async getCommentById() {
    try {
      this.firestore.collection("comments", ref => ref.where("idPost","==",this.id).orderBy("timestamp", "desc")).snapshotChanges().subscribe(
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
      console.log(error);
    }
  }

  async updatePost(post: Post) {
    if (this.formValidation()) {  //formValidation devuelve , true o false
      //show loading
      let loading = await this.loadingCtrl.create({
        message: "Por favor espere..."
      });

      await loading.present();

      try {
        await this.firestore.doc("posts/" + this.id).update(post);
      } catch (error) {
        this.appService.presentToast(error);
      }

      //dismiss loading
      await loading.dismiss();
      //redirect to home
      this.navCtrl.navigateRoot("admin");
    }
  }

  async CreateComment(comment: Comment) {
    if (this.formValidation()) {
      //show loading
      let loading = await this.loadingCtrl.create({
        message: "Por favor, espere.."
      });

      await loading.present();

      try {
        this.comment.date = moment().lang('es').format('dddd, D MMMM, h:mm a'); 
        this.comment.timestamp = Date.now();
        this.comment.driver = Math.floor(Math.random() * 999) + 50
        this.comment.idPost = this.id;
        await this.firestore.collection("comments").add(comment);
      } catch (error) {
        this.appService.presentToast(error);
        console.log(error);
      }
      await loading.dismiss();
      //Clear input
      this.clearFieldComment()
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
        console.log(error);
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

  async presentAlertConfirm(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message: 'Desea eliminar este aviso?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            console.log('Confirm Okay');
            this.appService.deletePost(this.id);
            this.navCtrl.navigateRoot('admin');
          }
        }
      ]
    });
    await alert.present();
  }

  async presentAlertConfirmDelete(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atención',
      message: 'Desea eliminar este comentario?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Eliminar',
          handler: async () => {
            console.log('Confirm Okay');
            this.appService.deleteComment(id);
            this.navCtrl.navigateRoot('edit-post');
          }
        }
      ]
    });
    await alert.present();
  }

  formValidation() {
    
    if (!this.post.detail || this.post.detail == "") {
      this.appService.presentToast("Ingrese una descripción");
      return false;
    } else {
      return true;
    }

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
      color: 'primary',
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
      color: 'secondary',
      fill: 'outline'
    },
    {
      name: 'Obras',
      imgpath: 'https://firebasestorage.googleapis.com/v0/b/hakepea-9e21a.appspot.com/o/category-detail%2Fobras250x200.png?alt=media&token=55d3b049-afba-4df9-b4b5-d65056a5c572',
      color: 'tertiary',
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

  compareWithFn = (o1, o2) => {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  };

  compareWith = this.compareWithFn;

  clearFieldComment(){
    this.comment.comment = '';
  }

}
