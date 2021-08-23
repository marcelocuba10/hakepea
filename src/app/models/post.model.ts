export interface Post{
    detail?:string;
    category?:string;
    date?: string;
    imgpath?: string;
    imgpathMarker?: string;
    timestamp?:number;
    liked?:number;
    disliked?:number;
    lat?:number;
    lng?:number;
}