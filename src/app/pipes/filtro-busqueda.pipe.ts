import { Post } from './../models/post.model';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filtroBusqueda'
})
export class FiltroBusquedaPipe implements PipeTransform {

  transform(posts: Post[], texto: string): Post[] {

    if (texto.length === 0) {
      return posts;
    }

    texto = texto.toLocaleLowerCase();

    //la funcion filter regresa un nuevo arreglo
    return posts.filter(post => {
      return post.detail.toLocaleLowerCase().includes(texto) || post.address.toLocaleLowerCase().includes(texto) || post.category.toLocaleLowerCase().includes(texto);
    });

  }

}
