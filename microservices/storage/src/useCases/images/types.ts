import {IImage} from 'api-client'

export interface RetrieveByIdDTO {
  image: IImage; // The image object
  count: number; // Total count of items (mocked as 1 in this case)
  pagination: { // Pagination details
    page: number;
    pageSize: number;
    filtered: number;
  };
}

export interface InsertImageDTO {
  fileName: string; // Name of the file being uploaded
  buffer: Buffer; // File content as a buffer
  workspaceId: string; // The ID of the workspace where the image is being uploaded
}

export interface DeleteImageDTO {
 id: string; // The ID of the image to be deleted
  workspaceId: string; // The ID of the workspace where the image is stored
}

export enum FileImageTypes {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  GIF = 'image/gif'
}
