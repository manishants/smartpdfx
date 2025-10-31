"use client";

import { Editor } from '@tinymce/tinymce-react';
import { useRef, useEffect } from 'react';
import { Card } from './card';
import { Label } from './label';

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

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <Card className="p-1">
        <Editor
          apiKey="no-api-key" // Using no-api-key for development
          onInit={(evt, editor) => editorRef.current = editor}
          value={value}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={{
            height: height,
            menubar: false,
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount',
              'emoticons', 'template', 'codesample'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic forecolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help | link image | code',
            content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px; line-height: 1.6; }',
            placeholder: placeholder,
            branding: false,
            resize: 'vertical',
            contextmenu: 'link image table',
            skin: 'oxide',
            content_css: 'default',
            setup: (editor) => {
              editor.on('init', () => {
                // Custom initialization if needed
              });
            }
          }}
        />
      </Card>
    </div>
  );
}

export default WysiwygEditor;