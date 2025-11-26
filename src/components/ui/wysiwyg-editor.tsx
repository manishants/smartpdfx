"use client";

import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';
import { Card } from './card';
import { Label } from './label';
import { MediaLibraryModal } from '@/components/media-library';
import { Button } from './button';

interface WysiwygEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function WysiwygEditor({
  value,
  onChange,
  placeholder = "Enter your content here...",
  height = 400,
  disabled = false,
  label,
  className = ""
}: WysiwygEditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  const insertImage = (url: string, alt?: string) => {
    const safeAlt = (alt || '').replace(/"/g, '&quot;');
    if (editorRef.current) {
      editorRef.current.insertContent(`<figure><img src="${url}" alt="${safeAlt}" /></figure>`);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Use the toolbar or add media below</div>
        <MediaLibraryModal
          title="Insert Media"
          onSelect={(file: any) => insertImage(file.url, file.alt || file.name)}
          trigger={
            <Button variant="outline" size="sm" className="gap-2">
              Add Media
            </Button>
          }
        />
      </div>
      <Card className="p-1">
        <Editor
          tinymceScriptSrc="https://cdn.jsdelivr.net/npm/tinymce@6/tinymce.min.js"
          onInit={(evt, editor) => editorRef.current = editor}
          value={value}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={{
            height: height,
            menubar: false,
            statusbar: true,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'anchor', 'code', 'searchreplace', 'visualblocks'
            ],
            // Use TinyMCE 6 "blocks" control (clearly shows Paragraph/H1/H2/H3)
            toolbar: 'blocks | bold italic underline | bullist numlist | blockquote | alignleft aligncenter alignright | link image | undo redo | removeformat | code',
            block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
            placeholder: placeholder,
            branding: false,
            resize: 'vertical',
            contextmenu: 'link image',
            skin: 'oxide',
            content_css: 'default',
            image_caption: true,
            image_title: true,
            image_advtab: true,
            link_default_target: '_blank',
            paste_data_images: true,
            convert_urls: false,
            toolbar_mode: 'wrap',
            setup: (editor) => {
              editor.on('init', () => {
                // Classic WordPress-like experience; no cloud prompts, minimal toolbar
              });
            }
          }}
        />
      </Card>
    </div>
  );
}

export default WysiwygEditor;