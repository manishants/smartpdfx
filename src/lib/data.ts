
import { FileSignature, FileJson, RotateCcw, Minimize2, LockOpen, ShieldQuestion, ShieldOff, FileUp, ScanText, FileImage, Users, Type, Video, Eraser, UserX, Share2, ArrowDownUp, Grid, Heart, MessageSquare, Pencil, Sparkles, Image as ImageIconLucide, Aperture, Car, AppWindow, Repeat, Milestone, TextQuote, Pilcrow, CaseUpper, QrCode, ClipboardPaste, Star, Palette, Trash2, SearchCheck, Contact, Link, Bot, PenSquare, Code2, Paintbrush, Home, Dumbbell, Utensils, Lightbulb, UserRound, Mail, BookOpen, Route, Music, ShoppingCart, BarChart3, Moon, VideoIcon, Speech, Scissors, Layers } from "lucide-react";

export const toolCategories = [
    { id: 'compress', name: 'Compress' },
    { id: 'organize', name: 'Organize PDF' },
    { id: 'edit', name: 'Edit PDF & Video' },
    { id: 'convert', name: 'Convert' },
    { id: 'security', name: 'Security' },
    { id: 'ai', name: 'AI Tools' },
    { id: 'color_tools', name: 'Color Tools' },
    { id: 'generators', name: 'Generators' },
    { id: 'text_tools', name: 'Text Tools' },
    { id: 'image_tools', name: 'Image Tools' },
    { id: 'link_tools', name: 'Link Tools'},
];

export const tools = [
  {
    title: "Compress Image",
    description: "Compress an image to a smaller size.",
    icon: ArrowDownUp,
    href: "/compress-image",
    category: 'compress',
    color: '#ef4444' // red
  },
  {
    title: "Compress PDF",
    description: "Reduce the size of your PDF.",
    icon: Minimize2,
    href: "/compress-pdf",
    category: 'compress',
    color: '#ef4444' // red
  },
  {
    title: "Under 100kb image",
    description: "Resize image to under 100kb.",
    icon: ArrowDownUp,
    href: "/under-100kb-image",
    category: 'compress',
    color: '#ef4444' // red
  },
  {
    title: "Under 30kb image",
    description: "Resize image to under 30kb.",
    icon: ArrowDownUp,
    href: "/under-30kb-image",
    category: 'compress',
    color: '#ef4444' // red
  },
  {
    title: "30kb Signature Image",
    description: "Create a small signature image.",
    icon: ArrowDownUp,
    href: "/30kb-signature-image",
    category: 'compress',
    color: '#ef4444' // red
  },

  {
    title: "Split PDF",
    description: "Split a PDF into multiple files.",
    icon: Scissors,
    href: "/split-pdf",
    category: 'organize',
    color: '#64748b' // dusty blue
  },
   {
    title: "Rotate PDF",
    description: "Rotate pages in your PDF.",
    icon: RotateCcw,
    href: "/rotate-pdf",
    category: 'organize',
    color: '#64748b' // dusty blue
  },
  {
    title: "Organize PDF Pages",
    description: "Re-order and delete PDF pages.",
    icon: AppWindow,
    href: "/organize-pdf",
    category: 'organize',
    color: '#64748b'
  },
  {
    title: "Delete PDF Pages",
    description: "Remove one or more pages from a PDF.",
    icon: Trash2,
    href: "/delete-pdf-pages",
    category: 'organize',
    color: '#64748b'
  },
  {
    title: "Add Page Numbers to PDF",
    description: "Add page numbers to a PDF.",
    icon: Milestone,
    href: "/add-page-numbers-to-pdf",
    category: 'organize',
    color: '#64748b'
  },
  {
    title: "PDF to Word",
    description: "Convert PDF to an editable Word file.",
    icon: FileUp,
    href: "/pdf-to-word",
    category: 'convert',
    color: '#f97316' // orange
  },
  {
    title: "PDF to Excel",
    description: "Convert PDF to an Excel spreadsheet.",
    icon: FileUp,
    href: "/pdf-to-excel",
    category: 'convert',
    color: '#f97316' // orange
  },
  {
    title: "PDF to PPT",
    description: "Convert PDF to PowerPoint.",
    icon: FileUp,
    href: "/pdf-to-ppt",
    category: 'convert',
    color: '#f97316' // orange
  },
  {
    title: "PDF to JPG",
    description: "Convert PDF pages to JPG images.",
    icon: FileImage,
    href: "/pdf-to-jpg",
    category: 'convert',
    color: '#ca8a04' // mud yellow
  },
  {
    title: "PPT to PDF",
    description: "Convert PowerPoint to PDF.",
    icon: FileImage,
    href: "/ppt-to-pdf",
    category: 'convert',
    color: '#f97316' // orange
  },
  {
    title: "JPG to PDF",
    description: "Convert JPG images to PDF.",
    icon: FileImage,
    href: "/jpg-to-pdf",
    category: 'convert',
    color: '#ca8a04' // mud yellow
  },
  {
    title: "PNG to PDF",
    description: "Convert PNG images to PDF.",
    icon: FileImage,
    href: "/png-to-pdf",
    category: 'convert',
    color: '#ca8a04' // mud yellow
  },
  {
    title: "Image Converter",
    description: "Convert between image formats.",
    icon: Repeat,
    href: "/image-converter",
    category: 'convert',
    color: '#ca8a04' // mud yellow
  },
  {
    title: "Edit PDF",
    description: "Add text, images, or shapes.",
    icon: Pencil,
    href: "/edit-pdf",
    category: 'edit',
    color: '#0ea5e9' // sky blue
  },
  {
    title: "e-Sign PDF",
    description: "Sign a PDF online.",
    icon: FileSignature,
    href: "/e-sign",
    category: 'edit',
    color: '#0ea5e9' // sky blue
  },
  {
    title: "Image Resizer",
    description: "Resize image by pixel or percentage.",
    icon: ImageIconLucide,
    href: "/image-resizer",
    category: 'image_tools',
    color: '#a855f7' // purple
  },
  {
    title: "Watermark Image",
    description: "Add text or image watermark.",
    icon: Aperture,
    href: "/watermark-image",
    category: 'image_tools',
    color: '#a855f7' // purple
  },
  {
    title: "Unlock PDF",
    description: "Remove password from a PDF.",
    icon: LockOpen,
    href: "/unlock-pdf",
    category: 'security',
    color: '#ec4899' // pink
  },
   {
    title: "Protect PDF",
    description: "Add a password to your PDF.",
    icon: ShieldQuestion,
    href: "/protect-pdf",
    category: 'security',
    color: '#ec4899' // pink
  },
  {
    title: "Image to Text (OCR)",
    description: "Extract text from an image.",
    icon: ScanText,
    href: "/image-to-text",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "PDF OCR",
    description: "Extract text from a PDF document.",
    icon: ScanText,
    href: "/pdf-ocr",
    category: 'ai',
    color: '#10b981'
  },
  
  {
    title: "QR Code Generator",
    description: "Create a QR code for any URL.",
    icon: QrCode,
    href: "/qr-code-generator",
    category: 'generators',
    color: '#f59e0b'
  },
  {
    title: "Favicon Generator",
    description: "Create a favicon.ico from an image.",
    icon: Star,
    href: "/favicon-generator",
    category: 'generators',
    color: '#f59e0b'
  },
  {
    title: "Privacy Policy Generator",
    description: "Generate a basic privacy policy.",
    icon: ShieldQuestion,
    href: "/privacy-policy-generator",
    category: 'generators',
    color: '#f59e0b'
  },
  {
    title: "Lorem Ipsum Generator",
    description: "Generate placeholder text.",
    icon: Pilcrow,
    href: "/lorem-ipsum-generator",
    category: 'generators',
    color: '#f59e0b'
  },
  {
    title: "What's My IP Address?",
    description: "Find your public IP address.",
    icon: AppWindow,
    href: "/whats-my-ip",
    category: 'text_tools',
    color: '#84cc16'
  },
  {
    title: "Case Converter",
    description: "Convert text case.",
    icon: CaseUpper,
    href: "/case-converter",
    category: 'text_tools',
    color: '#84cc16'
  },
  {
    title: "Image Color Picker",
    description: "Pick colors from an image.",
    icon: Palette,
    href: "/image-color-picker",
    category: 'color_tools',
    color: '#d946ef'
  },
  {
    title: "Website Color Picker",
    description: "Extract colors from a website.",
    icon: Palette,
    href: "/website-color-picker",
    category: 'color_tools',
    color: '#d946ef'
  },
  // Newly added tools
  {
    title: "Merge PDF",
    description: "Combine multiple PDFs into a single document.",
    icon: Layers,
    href: "/merge-pdf",
    category: 'organize',
    color: '#64748b'
  },
  {
    title: "Word to PDF",
    description: "Convert DOCX files to high-quality PDF.",
    icon: FileUp,
    href: "/word-to-pdf",
    category: 'convert',
    color: '#f97316'
  },
  {
    title: "PDF to Scanned PDF",
    description: "Rasterize pages for privacy-preserving scanned PDFs.",
    icon: ScanText,
    href: "/scan-pdf",
    category: 'security',
    color: '#ec4899'
  },
];

    
