
import { z } from 'zod';

export const ConvertImagesToPdfInputSchema = z.object({
  imageUris: z
    .array(
      z
        .string()
        .describe(
          "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        )
    )
    .describe('An array of image data URIs to convert to a PDF.'),
});
export type ConvertImagesToPdfInput = z.infer<
  typeof ConvertImagesToPdfInputSchema
>;

export const ConvertImagesToPdfOutputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "The resulting PDF file as a data URI with Base64 encoding. Format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ConvertImagesToPdfOutput = z.infer<
  typeof ConvertImagesToPdfOutputSchema
>;

export const CompressImageInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  quality: z.number().optional().describe('The quality of the compressed image (1-100).'),
});
export type CompressImageInput = z.infer<typeof CompressImageInputSchema>;

export const CompressImageOutputSchema = z.object({
  compressedImageUri: z.string().describe('The compressed image as a data URI.'),
  originalSize: z.number().describe('The original image size in bytes.'),
  compressedSize: z.number().describe('The compressed image size in bytes.'),
});
export type CompressImageOutput = z.infer<typeof CompressImageOutputSchema>;

export const UnlockPdfInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "A password-protected PDF as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  password: z.string().describe('The password to unlock the PDF.'),
});
export type UnlockPdfInput = z.infer<typeof UnlockPdfInputSchema>;

export const UnlockPdfOutputSchema = z.object({
  unlockedPdfUri: z
    .string()
    .describe(
      "The unlocked PDF file as a data URI. Format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type UnlockPdfOutput = z.infer<typeof UnlockPdfOutputSchema>;

export const ProtectPdfInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "A PDF as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  password: z.string().describe('The password to apply to the PDF.'),
});
export type ProtectPdfInput = z.infer<typeof ProtectPdfInputSchema>;

export const ProtectPdfOutputSchema = z.object({
  protectedPdfUri: z
    .string()
    .describe(
      "The protected PDF file as a data URI. Format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ProtectPdfOutput = z.infer<typeof ProtectPdfOutputSchema>;

export const OrganiseWhatsappChatInputSchema = z.object({
  chatContent: z
    .string()
    .describe('The full text content of the exported WhatsApp chat file.'),
});
export type OrganiseWhatsappChatInput = z.infer<
  typeof OrganiseWhatsappChatInputSchema
>;

const ParticipantMessageCountSchema = z.object({
    participant: z.string().describe("The name of the participant."),
    messageCount: z.number().describe("The number of messages sent by the participant.")
});

export const OrganiseWhatsappChatOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the conversation.'),
  participants: z
    .array(z.string())
    .describe('A list of all chat participant names.'),
  keyTopics: z
    .array(z.string())
    .describe('An array of the top 5 most discussed topics.'),
  statistics: z.object({
    totalMessages: z.number().describe('Total number of messages in the chat.'),
    messagesByParticipant: z
      .array(ParticipantMessageCountSchema)
      .describe('An array mapping participant names to their message count.'),
    mediaSharedCount: z
      .number()
      .describe('The total count of shared media items shared.'),
    mostActiveDay: z
      .string()
      .describe('The date with the most messages (YYYY-MM-DD).'),
  }),
});
export type OrganiseWhatsappChatOutput = z.infer<
  typeof OrganiseWhatsappChatOutputSchema
>;

const SignatureAssetSchema = z.object({
  id: z.string().describe("Unique identifier for the signature asset."),
  imageUri: z.string().describe("Signature image as a data URI (PNG/JPEG)."),
});
export type SignatureAsset = z.infer<typeof SignatureAssetSchema>;

const SignaturePlacementSchema = z.object({
  pageIndex: z
    .number()
    .int()
    .describe("The 0-based index of the page to place the signature on."),
  x: z.number().describe("The x-coordinate for the signature placement."),
  y: z.number().describe("The y-coordinate for the signature placement."),
  width: z.number().describe("The width of the signature."),
  height: z.number().describe("The height of the signature."),
  signatureId: z
    .string()
    .optional()
    .describe(
      "ID of the signature asset to use for this placement. If omitted, the single signatureImageUri will be used."
    ),
  dateText: z
    .string()
    .optional()
    .describe(
      "Optional date text to render near the signature (e.g., 'Signed on 2025-11-01')."
    ),
  dateOffsetX: z
    .number()
    .optional()
    .describe("Horizontal offset for date text relative to the signature box."),
  dateOffsetY: z
    .number()
    .optional()
    .describe("Vertical offset for date text relative to the signature box."),
  dateFontSize: z
    .number()
    .optional()
    .describe("Font size for the date text."),
});
export type SignaturePlacement = z.infer<typeof SignaturePlacementSchema>;

export const ESignPdfInputSchema = z.object({
  pdfUri: z.string().describe("The PDF file to be signed as a data URI."),
  signatureImageUri: z
    .string()
    .optional()
    .describe(
      "The signature image as a data URI for single-asset signing. Optional when using 'signatures'."
    ),
  signatures: z
    .array(SignatureAssetSchema)
    .optional()
    .describe(
      "Optional list of signature assets to support multi-signer placements."
    ),
  placements: z
    .array(SignaturePlacementSchema)
    .describe("An array of signature placements."),
});
export type ESignPdfInput = z.infer<typeof ESignPdfInputSchema>;

export const ESignPdfOutputSchema = z.object({
  signedPdfUri: z.string().describe("The signed PDF as a data URI."),
});
export type ESignPdfOutput = z.infer<typeof ESignPdfOutputSchema>;


const PageRangeSchema = z.object({
  from: z.number().int().min(1),
  to: z.number().int().min(1),
});
export type PageRange = z.infer<typeof PageRangeSchema>;

export const SplitPdfInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "A PDF as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  ranges: z
    .array(PageRangeSchema)
    .describe(
      'An array of page ranges to extract. Each range is an object with "from" and "to" page numbers (1-indexed and inclusive).'
    ),
});
export type SplitPdfInput = z.infer<typeof SplitPdfInputSchema>;


const SplitPdfFileSchema = z.object({
    filename: z.string().describe('The suggested filename for the split PDF.'),
    pdfUri: z.string().describe('The data URI of the split PDF file.'),
});

export const SplitPdfOutputSchema = z.object({
  splitPdfs: z.array(SplitPdfFileSchema).describe('An array of the generated PDF files.'),
});
export type SplitPdfOutput = z.infer<typeof SplitPdfOutputSchema>;


export const MergePdfInputSchema = z.object({
  pdfUris: z
    .array(
      z
        .string()
        .describe(
          "A PDF as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
        )
    )
    .describe('An array of PDF data URIs to merge.'),
});
export type MergePdfInput = z.infer<typeof MergePdfInputSchema>;

export const MergePdfOutputSchema = z.object({
  mergedPdfUri: z
    .string()
    .describe(
      "The resulting merged PDF file as a data URI. Format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type MergePdfOutput = z.infer<typeof MergePdfOutputSchema>;

const RotationSchema = z.object({
  pageIndex: z.number().int().min(0).describe("The 0-indexed page to rotate."),
  angle: z.number().refine(val => val % 90 === 0, {
    message: "Angle must be a multiple of 90",
  }).describe("The rotation angle in degrees (90, 180, 270)."),
});
export type Rotation = z.infer<typeof RotationSchema>;

export const RotatePdfInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "A PDF as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
  rotations: z.array(RotationSchema).describe("An array of rotation instructions."),
});
export type RotatePdfInput = z.infer<typeof RotatePdfInputSchema>;

export const RotatePdfOutputSchema = z.object({
  rotatedPdfUri: z
    .string()
    .describe(
      "The rotated PDF file as a data URI. Format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type RotatePdfOutput = z.infer<typeof RotatePdfOutputSchema>;

export const CompressPdfInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "A PDF as a data URI. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type CompressPdfInput = z.infer<typeof CompressPdfInputSchema>;

export const CompressPdfOutputSchema = z.object({
  compressedPdfUri: z.string().describe('The compressed PDF as a data URI.'),
  originalSize: z.number().describe('The original PDF size in bytes.'),
  compressedSize: z.number().describe('The compressed PDF size in bytes.'),
});
export type CompressPdfOutput = z.infer<typeof CompressPdfOutputSchema>;

// Word to PDF
export const WordToPdfInputSchema = z.object({
  docxUri: z.string().describe("The DOCX file as a data URI."),
});
export type WordToPdfInput = z.infer<typeof WordToPdfInputSchema>;

export const WordToPdfOutputSchema = z.object({
  pdfUri: z.string().describe("The converted PDF document as a data URI."),
});
export type WordToPdfOutput = z.infer<typeof WordToPdfOutputSchema>;


// PPT to PDF
export const PptToPdfInputSchema = z.object({
  pptxUri: z.string().describe("A PPTX as a data URI."),
});
export type PptToPdfInput = z.infer<typeof PptToPdfInputSchema>;

export const PptToPdfOutputSchema = z.object({
  pdfUri: z.string().describe("The converted PDF document as a data URI."),
});
export type PptToPdfOutput = z.infer<typeof PptToPdfOutputSchema>;


// Trim Video
export const TrimVideoInputSchema = z.object({
  videoUri: z.string().describe("A video file as a data URI."),
  startTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format. Use HH:MM:SS.").describe("The start time for the trim (HH:MM:SS)."),
  endTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format. Use HH:MM:SS.").describe("The end time for the trim (HH:MM:SS)."),
});
export type TrimVideoInput = z.infer<typeof TrimVideoInputSchema>;

export const TrimVideoOutputSchema = z.object({
  trimmedVideoUri: z.string().describe("The trimmed video file as a data URI."),
});
export type TrimVideoOutput = z.infer<typeof TrimVideoOutputSchema>;


// Crop Video
export const CropVideoInputSchema = z.object({
  width: z.number().int().positive("Width must be a positive integer."),
  height: z.number().int().positive("Height must be a positive integer."),
  x: z.number().int().min(0, "X offset cannot be negative."),
  y: z.number().int().min(0, "Y offset cannot be negative."),
  videoUri: z.string().describe("A video file as a data URI."),
});
export type CropVideoInput = z.infer<typeof CropVideoInputSchema>;

export const CropVideoOutputSchema = z.object({
  croppedVideoUri: z.string().describe("The cropped video file as a data URI."),
});
export type CropVideoOutput = z.infer<typeof CropVideoOutputSchema>;

export const ConvertPdfToImagesInputSchema = z.object({
  pdfUri: z.string().describe("A PDF as a data URI."),
});
export type ConvertPdfToImagesInput = z.infer<typeof ConvertPdfToImagesInputSchema>;

export const ConvertPdfToImagesOutputSchema = z.object({
  imageUris: z.array(z.string()).describe("An array of data URIs for the converted images."),
});
export type ConvertPdfToImagesOutput = z.infer<typeof ConvertPdfToImagesOutputSchema>;

export const PdfOcrInputSchema = z.object({
  pdfUri: z
    .string()
    .describe(
      "A PDF as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type PdfOcrInput = z.infer<typeof PdfOcrInputSchema>;

export const PdfOcrOutputSchema = z.object({
  text: z.string().describe('The extracted text from the PDF.'),
});
export type PdfOcrOutput = z.infer<typeof PdfOcrOutputSchema>;

// Blog Post
const FaqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});
export type Faq = z.infer<typeof FaqSchema>;

export const BlogPostSchema = z.object({
    id: z.number().optional(),
    slug: z.string(),
    title: z.string(),
    content: z.string(),
    imageUrl: z.string(),
    author: z.string(),
    date: z.string(),
    published: z.boolean().default(true),
    seoTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    faqs: z.array(FaqSchema).optional(),
    category: z.string().optional(),
    popular: z.boolean().optional(),
    // Support The Author fields
    upiId: z.string().optional(),
    paypalId: z.string().optional(),
    supportQrUrl: z.string().optional(),
    supportLabel: z.string().optional(),
    layoutSettings: z
      .object({
        showBreadcrumbs: z.boolean().default(true).optional(),
        leftSidebarEnabled: z.boolean().default(true).optional(),
        rightSidebarEnabled: z.boolean().default(true).optional(),
        leftSticky: z.boolean().default(false).optional(),
        tocFontSize: z.string().optional(),
        tocH3Indent: z.number().default(12).optional(),
        tocHoverColor: z.string().optional(),
      })
      .optional(),
});
export type BlogPost = z.infer<typeof BlogPostSchema>;

const PointSchema = z.object({ x: z.number(), y: z.number() });

// PDF Editor
export const PdfEditSchema = z.object({
    type: z.enum(['text', 'image', 'rectangle', 'drawing', 'highlight', 'cover']),
    pageIndex: z.number().int().min(0),
    content: z.string().describe('Text content, image data URI, or color for shapes'),
    points: z.array(PointSchema).optional().describe('Array of points for freehand drawing/highlighting'),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    fontSize: z.number().optional(),
    rotation: z.number().optional(),
    backgroundColor: z.string().optional().describe("Background color for shapes"),
    strokeColor: z.string().optional(),
    strokeWidth: z.number().optional(),
});
export type PdfEdit = z.infer<typeof PdfEditSchema>;

export const EditPdfInputSchema = z.object({
  pdfUri: z.string().describe("The PDF to edit as a data URI."),
  edits: z.array(PdfEditSchema),
});
export type EditPdfInput = z.infer<typeof EditPdfInputSchema>;

export const EditPdfOutputSchema = z.object({
  editedPdfUri: z.string().describe("The edited PDF as a data URI."),
});
export type EditPdfOutput = z.infer<typeof EditPdfOutputSchema>;


// Photo Enhancer
export const EnhancePhotoInputSchema = z.object({
  photoUri: z
    .string()
    .describe(
      "An image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EnhancePhotoInput = z.infer<typeof EnhancePhotoInputSchema>;

export const EnhancePhotoOutputSchema = z.object({
  enhancedPhotoUri: z.string().describe('The enhanced photo as a data URI.'),
});
export type EnhancePhotoOutput = z.infer<typeof EnhancePhotoOutputSchema>;

// PDF Page Organizer
export const OrganizePdfInputSchema = z.object({
  pdfUri: z.string().describe("The PDF to organize as a data URI."),
  pageOrder: z.array(z.number().int().min(0)).describe("An array of 0-based page indices in the desired new order."),
});
export type OrganizePdfInput = z.infer<typeof OrganizePdfInputSchema>;

export const OrganizePdfOutputSchema = z.object({
  organizedPdfUri: z.string().describe("The reorganized PDF as a data URI."),
});
export type OrganizePdfOutput = z.infer<typeof OrganizePdfOutputSchema>;

// Add Page Numbers to PDF
export const AddPageNumbersInputSchema = z.object({
  pdfUri: z.string().describe("The PDF to modify as a data URI."),
  position: z.enum([
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ]).describe("The position to place the page numbers."),
});
export type AddPageNumbersInput = z.infer<typeof AddPageNumbersInputSchema>;

export const AddPageNumbersOutputSchema = z.object({
  numberedPdfUri: z.string().describe("The PDF with page numbers as a data URI."),
});
export type AddPageNumbersOutput = z.infer<typeof AddPageNumbersOutputSchema>;

// Image Converter
export const ConvertImageInputSchema = z.object({
  imageUri: z.string().describe("The image to convert as a data URI."),
  format: z.enum(['jpeg', 'png', 'webp', 'gif', 'tiff']).describe("The target image format."),
});
export type ConvertImageInput = z.infer<typeof ConvertImageInputSchema>;

export const ConvertImageOutputSchema = z.object({
  convertedImageUri: z.string().describe("The converted image as a data URI."),
});
export type ConvertImageOutput = z.infer<typeof ConvertImageOutputSchema>;

// Image Resizer
export const ResizeImageInputSchema = z.object({
  imageUri: z.string().describe("The image to resize as a data URI."),
  width: z.number().int().optional().describe("The target width in pixels."),
  height: z.number().int().optional().describe("The target height in pixels."),
  percentage: z.number().int().optional().describe("The resize percentage."),
});
export type ResizeImageInput = z.infer<typeof ResizeImageInputSchema>;

export const ResizeImageOutputSchema = z.object({
  resizedImageUri: z.string().describe("The resized image as a data URI."),
});
export type ResizeImageOutput = z.infer<typeof ResizeImageOutputSchema>;

// Watermark Image
export const WatermarkImageInputSchema = z.object({
  imageUri: z.string().describe("The image to watermark as a data URI."),
  watermark: z.object({
    type: z.enum(['text', 'image']),
    content: z.string().describe("The text content or image data URI for the watermark."),
    position: z.enum([
      'top-left', 'top-center', 'top-right',
      'center-left', 'center', 'center-right',
      'bottom-left', 'bottom-center', 'bottom-right'
    ]),
    scale: z.number().min(0.1).max(1).describe("Scale of the watermark relative to the image size."),
    opacity: z.number().min(0).max(1),
  }),
});
export type WatermarkImageInput = z.infer<typeof WatermarkImageInputSchema>;

export const WatermarkImageOutputSchema = z.object({
  watermarkedImageUri: z.string().describe("The watermarked image as a data URI."),
});
export type WatermarkImageOutput = z.infer<typeof WatermarkImageOutputSchema>;

// QR Code Generator
export const GenerateQrCodeInputSchema = z.object({
  text: z.string().min(1, "Text cannot be empty.").describe("The text or URL to encode."),
});
export type GenerateQrCodeInput = z.infer<typeof GenerateQrCodeInputSchema>;

export const GenerateQrCodeOutputSchema = z.object({
  qrCodeImageUri: z.string().describe("The generated QR code as a PNG data URI."),
});
export type GenerateQrCodeOutput = z.infer<typeof GenerateQrCodeOutputSchema>;

// Favicon Generator
export const GenerateFaviconInputSchema = z.object({
  imageUri: z.string().describe("The source image as a data URI."),
});
export type GenerateFaviconInput = z.infer<typeof GenerateFaviconInputSchema>;

export const GenerateFaviconOutputSchema = z.object({
  faviconUri: z.string().describe("The generated favicon as an ICO data URI."),
});
export type GenerateFaviconOutput = z.infer<typeof GenerateFaviconOutputSchema>;


const BoundingBoxSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const PdfElementSchema = z.object({
    type: z.enum(['text', 'image']),
    pageIndex: z.number().int().min(0),
    box: BoundingBoxSchema,
    text: z.string().optional(),
    content: z.string().describe('For text, the text. For images, the base64 data.'),
});

export const FindPdfElementsOutputSchema = z.object({
  elements: z.array(PdfElementSchema),
  pageWidth: z.number(),
  pageHeight: z.number(),
});
export type FindPdfElementsOutput = z.infer<typeof FindPdfElementsOutputSchema>;

export const FindPdfElementsInputSchema = z.object({
  imageUri: z.string().describe("The image of the PDF page to analyze.").optional(),
  pageWidth: z.number(),
  pageHeight: z.number(),
  language: z.string().optional().describe("The language of the document for better OCR accuracy."),
});
export type FindPdfElementsInput = z.infer<typeof FindPdfElementsInputSchema>;

// Website Screenshot
export const GetWebsiteScreenshotInputSchema = z.object({
  url: z.string().url().describe("The URL of the website to capture."),
});
export type GetWebsiteScreenshotInput = z.infer<typeof GetWebsiteScreenshotInputSchema>;

export const GetWebsiteScreenshotOutputSchema = z.object({
  screenshotUri: z.string().describe("A data URI of the captured screenshot image."),
});
export type GetWebsiteScreenshotOutput = z.infer<typeof GetWebsiteScreenshotOutputSchema>;

// Delete PDF Pages
export const DeletePdfPagesInputSchema = z.object({
  pdfUri: z.string().describe("The PDF to modify as a data URI."),
  pagesToKeep: z.array(z.number().int().min(0)).describe("An array of 0-based page indices to keep in the final document."),
});
export type DeletePdfPagesInput = z.infer<typeof DeletePdfPagesInputSchema>;

export const DeletePdfPagesOutputSchema = z.object({
  modifiedPdfUri: z.string().describe("The modified PDF as a data URI."),
});
export type DeletePdfPagesOutput = z.infer<typeof DeletePdfPagesOutputSchema>;

// Voter List Extractor
export const ExtractVotersInputSchema = z.object({
  fileUri: z.string().describe("The voter list file (PDF or image) as a data URI."),
});
export type ExtractVotersInput = z.infer<typeof ExtractVotersInputSchema>;

const VoterSchema = z.object({
  id: z.string().describe('The serial number of the voter in the list.'),
  name: z.string().describe("The voter's full name."),
  fatherOrHusbandName: z.string().describe("The name of the voter's father or husband."),
  age: z.string().describe("The voter's age."),
  gender: z.string().describe("The voter's gender."),
  voterId: z.string().describe("The voter's ID card number."),
});
export type Voter = z.infer<typeof VoterSchema>;

export const ExtractVotersOutputSchema = z.object({
  voters: z.array(VoterSchema),
});
export type ExtractVotersOutput = z.infer<typeof ExtractVotersOutputSchema>;

// Image to Text (OCR)
export const ImageToTextInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "The image to extract text from, as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  language: z.string().optional().describe('The language of the text in the image (e.g., "English", "Hindi", "English and Hindi").'),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

export const ImageToTextOutputSchema = z.object({
  text: z.string().describe('The extracted text from the image.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

// PDF to Word
export const PdfToWordInputSchema = z.object({
  pdfUri: z.string().describe("The PDF to convert as a data URI."),
  conversionMode: z
    .enum(["no_ocr", "ai_ocr"]) // no_ocr: selectable text PDFs; ai_ocr: scanned PDFs
    .optional()
    .describe(
      'Conversion mode: "no_ocr" for PDFs with selectable text using local converter; "ai_ocr" for scanned PDFs using AI OCR.'
    ),
});
export type PdfToWordInput = z.infer<typeof PdfToWordInputSchema>;

export const WordContentSchema = z.object({
    text: z.string(),
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    color: z.string().optional(),
    fontSize: z.number().optional(),
});
export type WordContent = z.infer<typeof WordContentSchema>;

export const PdfToWordOutputSchema = z.object({
  docxUri: z.string().describe("The converted Word document as a data URI."),
});
export type PdfToWordOutput = z.infer<typeof PdfToWordOutputSchema>;

// PDF to Excel
export const PdfToExcelInputSchema = z.object({
  pdfUri: z.string().describe("The PDF to convert as a data URI."),
  conversionMode: z
    .enum(["no_ocr", "ai_ocr"]) // no_ocr: selectable text PDFs; ai_ocr: scanned PDFs
    .optional()
    .describe(
      'Conversion mode: "no_ocr" for PDFs with selectable text using local converter; "ai_ocr" for scanned PDFs using AI OCR.'
    ),
});
export type PdfToExcelInput = z.infer<typeof PdfToExcelInputSchema>;

export const PdfToExcelOutputSchema = z.object({
  xlsxUri: z.string().describe("The converted Excel workbook as a data URI."),
});
export type PdfToExcelOutput = z.infer<typeof PdfToExcelOutputSchema>;


// Text to Image
export const TextToImageInputSchema = z.object({
  prompt: z.string().describe("The text prompt to generate an image from."),
  style: z.string().optional().describe("The artistic style of the image."),
});
export type TextToImageInput = z.infer<typeof TextToImageInputSchema>;

export const TextToImageOutputSchema = z.object({
  imageUri: z.string().describe("The generated image as a data URI."),
});
export type TextToImageOutput = z.infer<typeof TextToImageOutputSchema>;

// Background Remover
export const RemoveBackgroundInputSchema = z.object({
  photoUri: z
    .string()
    .describe(
      "An image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type RemoveBackgroundInput = z.infer<typeof RemoveBackgroundInputSchema>;

export const RemoveBackgroundOutputSchema = z.object({
  resultUri: z.string().describe('The resulting image with a transparent background as a data URI.'),
});
export type RemoveBackgroundOutput = z.infer<typeof RemoveBackgroundOutputSchema>;

// Face Blur
export const BlurFaceInputSchema = z.object({
  imageUri: z
    .string()
    .describe(
      "An image as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type BlurFaceInput = z.infer<typeof BlurFaceInputSchema>;

export const BlurFaceOutputSchema = z.object({
  blurredImageUri: z.string().describe('The image with blurred faces as a data URI.'),
});
export type BlurFaceOutput = z.infer<typeof BlurFaceOutputSchema>;

// AI Interior Designer
export const RedesignRoomInputSchema = z.object({
  photoUri: z.string().describe("A photo of a room as a data URI."),
  style: z.string().describe("The desired design style (e.g., Modern, Minimalist)."),
});
export type RedesignRoomInput = z.infer<typeof RedesignRoomInputSchema>;

export const RedesignRoomOutputSchema = z.object({
  redesignedPhotoUri: z.string().describe("The redesigned room photo as a data URI."),
});
export type RedesignRoomOutput = z.infer<typeof RedesignRoomOutputSchema>;

// Resume Assistant
export const ResumeAssistantInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the user's resume."),
});
export type ResumeAssistantInput = z.infer<typeof ResumeAssistantInputSchema>;

export const ResumeAssistantOutputSchema = z.object({
  overallScore: z.number().describe("A score from 0-100 evaluating the resume's overall quality."),
  overallImpression: z.string().describe("A brief, one-paragraph summary of the AI's first impression."),
  feedback: z.string().describe("Detailed, actionable feedback formatted in Markdown. It should have sections for 'Strengths' and 'Areas for Improvement' with bullet points."),
});
export type ResumeAssistantOutput = z.infer<typeof ResumeAssistantOutputSchema>;
