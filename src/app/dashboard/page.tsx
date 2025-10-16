"use client";
import Link from "next/link";
import Image from "next/image";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Edit, 
  FileText, 
  FilePlus, 
  FileOutput, 
  Image as ImageIcon, 
  Scissors, 
  Lock, 
  Unlock, 
  FileSignature, 
  RotateCw,
  Trash2,
  Search,
  Bell,
  User,
  Settings,
  RotateCcw,
  FileImage,
  FileDown,
  Wand2,
  Palette,
  Ruler,
  Aperture,
  Globe,
  MousePointer,
  Type,
  Repeat,
  ArrowDownUp
} from "lucide-react";
import { tools } from "@/lib/data";
interface ToolCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  bgColor?: string;
  iconColor?: string;
}
const ToolCard = ({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  bgColor = "bg-blue-50", 
  iconColor = "text-blue-600" 
}: ToolCardProps) => {
  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-full transition-all hover:shadow-md hover:-translate-y-1">
        <div className={`${bgColor} ${iconColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
};
export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <Image 
          src="/smartpdfx_logo.webp" 
          alt="SmartPDFx Logo" 
          width={200} 
          height={60} 
          className="h-12 w-auto"
          priority
        />
      </div>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-500 mt-1">
              Access all your favorite PDF tools in one place
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Search className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-500" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Settings className="h-5 w-5 text-gray-500" />
            </button>
            <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
              <User className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Most Popular PDF Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ToolCard
              icon={Edit}
              title="Edit PDF"
              description="Add text, images, shapes or annotations"
              href="/edit-pdf"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <ToolCard
              icon={FilePlus}
              title="Merge PDF"
              description="Combine multiple PDFs into one"
              href="/merge-pdf"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <ToolCard
              icon={FileOutput}
              title="Compress PDF"
              description="Reduce file size while optimizing quality"
              href="/compress-pdf"
              bgColor="bg-red-50"
              iconColor="text-red-600"
            />
            <ToolCard
              icon={FileText}
              title="PDF to Word"
              description="Convert PDF to editable Word document"
              href="/pdf-to-word"
              bgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <ToolCard
              icon={ImageIcon}
              title="PDF to Image"
              description="Convert PDF pages to JPG images"
              href="/pdf-to-jpg"
              bgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
            <ToolCard
              icon={Lock}
              title="Protect PDF"
              description="Secure PDF with password protection"
              href="/protect-pdf"
              bgColor="bg-cyan-50"
              iconColor="text-cyan-600"
            />
            <ToolCard
              icon={Unlock}
              title="Unlock PDF"
              description="Remove password from protected PDFs"
              href="/unlock-pdf"
              bgColor="bg-rose-50"
              iconColor="text-rose-600"
            />
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Convert PDF</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ToolCard
              icon={FileText}
              title="PDF to Word"
              description="Convert PDF to editable Word document"
              href="/pdf-to-word"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <ToolCard
              icon={ImageIcon}
              title="PDF to Image"
              description="Convert PDF pages to JPG images"
              href="/pdf-to-jpg"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <ToolCard
              icon={FileImage}
              title="JPG to PDF"
              description="Convert JPG images to PDF document"
              href="/jpg-to-pdf"
              bgColor="bg-green-50"
              iconColor="text-green-600"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Edit & Organize</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ToolCard
              icon={Edit}
              title="Edit PDF"
              description="Add text, images, shapes or annotations"
              href="/edit-pdf"
              bgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <ToolCard
              icon={RotateCw}
              title="Rotate PDF"
              description="Rotate PDF pages as needed"
              href="/rotate-pdf"
              bgColor="bg-pink-50"
              iconColor="text-pink-600"
            />
            <ToolCard
              icon={Trash2}
              title="Delete Pages"
              description="Remove unwanted pages from PDF"
              href="/delete-pdf-pages"
              bgColor="bg-teal-50"
              iconColor="text-teal-600"
            />
            <ToolCard
              icon={FileSignature}
              title="E-Sign PDF"
              description="Add digital signatures to your PDFs"
              href="/e-sign"
              bgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Image Tools</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <ToolCard
              icon={Repeat}
              title="Image Converter"
              description="Convert images between different formats"
              href="/image-converter"
              bgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
            <ToolCard
              icon={FileOutput}
              title="Compress Image"
              description="Reduce image file size"
              href="/compress-image"
              bgColor="bg-red-50"
              iconColor="text-red-600"
            />
            <ToolCard
              icon={Ruler}
              title="Image Resizer"
              description="Resize images to specific dimensions"
              href="/image-resizer"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <ToolCard
              icon={Wand2}
              title="Photo Enhancer"
              description="Enhance photo quality with AI"
              href="/photo-enhancer"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
