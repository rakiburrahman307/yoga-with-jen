export interface IVideo {
  title: string;
  category: string;
  subCategory: string;
  duration: string;
  equipment: string[];
  thumbnail: string;
  videoUrl: string;
  description: string;
  status: 'active' | 'inactive';
}
