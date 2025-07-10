export interface ICreatePost {
     title: string;
     type: string;
     duration: string;
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     description: string;
     publishAt: Date;
     status: 'active' | 'inactive';
     isDeleted: boolean;
}
