export interface IVideo {
  title: string;
  category: string;
  subCategory: string;
  duration: string;
  type: string;
  equipment: string[];
  thumbnailUrl: string;
  videoUrl: string;
  description: string;
  status: 'active' | 'inactive';
}
