export interface IComingSoon {
     title: string;
     category: string;
     subCategory: string;
     duration?: string;
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     redirectUrl: string;
     isReady: 'comingSoon' | 'itsHere' | 'CheckThisOut';
     description?: string;
     status: 'active' | 'inactive';
}
