export interface IDailyInspiration {
    title: string;
    category: string;
    duration: string;
    equipment: string[];
    thumbnailUrl: string;
    videoUrl: string;
    description: string;
    status: 'active' | 'inactive';
}
