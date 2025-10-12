
import { FileSignature, Scissors, FileJson, RotateCcw, Minimize2, LockOpen, ShieldQuestion, ShieldOff, FileUp, ScanText, FileImage, Users, Type, Video, Eraser, UserX, Share2, ArrowDownUp, Crop, Grid, Heart, MessageSquare, Pencil, Sparkles, Image as ImageIconLucide, Aperture, Car, AppWindow, Repeat, Milestone, TextQuote, Pilcrow, CaseUpper, QrCode, ClipboardPaste, Star, Palette, Trash2, SearchCheck, Contact, Link, Bot, PenSquare, Code2, Paintbrush, Home, Dumbbell, Utensils, Lightbulb, UserRound, Mail, BookOpen, Route, Music, ShoppingCart, BarChart3, Moon, VideoIcon, Speech } from "lucide-react";

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
  // AI Tools First
  {
    title: "AI Interior Designer",
    description: "Redesigns a room from a photo.",
    icon: Home,
    href: "/ai-interior-designer",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "AI Story Generator",
    description: "Writes a short story from a user's prompt.",
    icon: PenSquare,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Blog Post Idea Generator",
    description: "Creates titles and outlines from a topic.",
    icon: Lightbulb,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Code Explainer",
    description: "Explains a piece of code in plain English.",
    icon: Code2,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Image Background Remover",
    description: "Automatically removes the background from an image.",
    icon: Eraser,
    href: "/remove-background",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Personalized Workout Planner",
    description: "Creates custom workout plans based on user goals.",
    icon: Dumbbell,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Meal Planner & Recipe Generator",
    description: "Generates weekly meal plans and recipes.",
    icon: Utensils,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Logo Concept Generator",
    description: "Designs logo ideas from a company description.",
    icon: Paintbrush,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Resume Assistant",
    description: "Reviews a resume and suggests improvements.",
    icon: UserRound,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Email Responder",
    description: "Drafts professional replies to emails.",
    icon: Mail,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "PDF Summarizer",
    description: "Reads a PDF and provides a concise summary.",
    icon: BookOpen,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Travel Itinerary Planner",
    description: "Creates a detailed travel itinerary.",
    icon: Route,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Lyric and Melody Writer",
    description: "Generates song lyrics and a basic melody.",
    icon: Music,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Product Description Writer",
    description: "Writes compelling descriptions for products.",
    icon: ShoppingCart,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Market Trend Analyzer",
    description: "Summarizes market trends from news or data.",
    icon: BarChart3,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Dream Interpreter",
    description: "Offers possible interpretations of a dream.",
    icon: Moon,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Face Swapper",
    description: "Swaps faces between two uploaded photos.",
    icon: UserX,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Video Script Generator",
    description: "Creates a script for a video from an outline.",
    icon: VideoIcon,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Domain Name Suggester",
    description: "Suggests available domain names for a business idea.",
    icon: SearchCheck,
    href: "#",
    category: 'ai',
    color: '#10b981'
  },

  // Existing Tools
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
    title: "Merge PDF",
    description: "Combine multiple PDFs into one.",
    icon: FileJson,
    href: "/merge-pdf",
    category: 'organize',
    color: '#64748b' // dusty blue
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
    title: "Trim Video",
    description: "Cut your video files.",
    icon: Scissors,
    href: "/trim-video",
    category: 'edit',
    color: '#0ea5e9' // sky blue
  },
    {
    title: "Crop Video",
    description: "Crop to desired dimensions.",
    icon: Crop,
    href: "/crop-video",
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
    title: "Whatsapp Chat Analyzer",
    description: "Analyze and summarize chats.",
    icon: MessageSquare,
    href: "/whatsapp-chat-organiser",
    category: 'ai',
    color: '#10b981' // emerald
  },
    {
    title: "Photo Enhancer",
    description: "Upscale and improve photo quality.",
    icon: Sparkles,
    href: "/photo-enhancer",
    category: 'ai',
    color: '#10b981'
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
    title: "Voter List Extractor",
    description: "Extract data from voter lists.",
    icon: Users,
    href: "/voter-list-extractor",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Extract Data from PDF to Excel",
    description: "Visually extract data to Excel.",
    icon: Users,
    href: "/extract-pdf-data-to-excel",
    category: 'ai',
    color: '#10b981'
  },
  {
    title: "Text to Image",
    description: "Generate an image from text.",
    icon: ImageIconLucide,
    href: "/text-to-image",
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
  {
    title: "Short Link Generator",
    description: "Create short, custom-branded links.",
    icon: Link,
    href: "/short-link-generator",
    category: 'link_tools',
    color: '#3b82f6' // blue
  }
];

    
