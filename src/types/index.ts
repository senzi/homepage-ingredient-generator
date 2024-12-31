export interface ProfileData {
  circleName: string;
  personalInfo: {
    avatar: string;
    mainInterests: string;
    otherInterests: string;
    keywords: string[];
    attributes: {
      [key: string]: {
        options: [string, string];
        selected: 0 | 1;
      }
    }
  };
  ingredients: Array<{
    name: string;
    image: string;
    percentage: number;
    trend: 'up' | 'stable' | 'down';
    order: number;
    position: {
      row: 0 | 1;
      column: 0 | 1 | 2;
    }
  }>;
}
