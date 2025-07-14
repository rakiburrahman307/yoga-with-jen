export interface IChallenge {
     title: string;
     category: string;
     duration: string;
     equipment: string[];
     thumbnailUrl: string;
     videoUrl: string;
     description: string;
     publishAt: Date;
     status: 'active' | 'inactive';
}

export interface IChallengeCategory {
     name: string;
     series: number;
     image: string;
     description: string;
     status: 'active' | 'inactive';
}
