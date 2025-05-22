export interface IComeingSoon {
     title: string;
     category: string;
     subCategory: string;
     duration: string;
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     description: string;
     status: 'active' | 'inactive';
}
