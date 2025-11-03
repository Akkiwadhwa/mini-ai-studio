export interface GenerationPayload {
  userId: number;
  imageUrl: string;
  prompt: string;
  style: string;
  status: string;
  createdAt: string;
}

export interface GenerationRecord extends GenerationPayload {
  id: number;
}
