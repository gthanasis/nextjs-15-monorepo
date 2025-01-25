export class IImage {
  id?: string;             // Unique identifier for the image, e.g., file name or ID in the storage system
  name?: string;           // Name of the image file
  contentType?: string;    // MIME type of the image (e.g., "image/png", "image/jpeg")
  size: number;           // Size of the image in bytes
  url: string;            // Public URL to access the image (if available)
  createdAt?: string;      // Date when the image was uploaded or created (ISO format)
  updatedAt?: string;     // Optional: Date when the image was last updated (ISO format)
  metadata?: {            // Optional: Additional metadata about the image
    [key: string]: any;   // Flexible structure for storing extra data like tags, descriptions, etc.
  };
}
