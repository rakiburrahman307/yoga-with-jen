export interface IComingSoon {
     title: string;
     category: string;
     subCategory: string;
     duration?: string;
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     redirectUrl: string;
     isReady: 'arrivedSoon' | 'ready';
     description: string;
     status: 'active' | 'inactive';
}
