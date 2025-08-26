export interface IDailyInspiration {
     title: string;
     serial: number;
     duration: string;
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     description: string;
     publishAt: Date;
     status: 'active' | 'inactive';
}
