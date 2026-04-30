'use client';

import { Editor } from '@tinymce/tinymce-react';
import { useRef } from 'react';

interface TinyMCEWrapperProps {
  value: string;
  onChange: (data: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function TinyMCEWrapper({ value, onChange, disabled = false, placeholder }: TinyMCEWrapperProps) {
  const editorRef = useRef<any>(null);

  return (
    <Editor
      apiKey="g6yrur70ud67rx6rqxxpsl2ppkodlugcrkp46jker7cbacvu"
      onInit={(evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      disabled={disabled}
      init={{
        height: 300,
        menubar: false,
        plugins: [
          'lists', 'link', 'charmap',
          'searchreplace', 'code', 'fullscreen',
          'insertdatetime', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | formatselect | ' +
          'bold italic | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | help',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        placeholder: placeholder || 'Type here...',
        skin: 'oxide',
        content_css: 'default',
        branding: false,
        promotion: false,
      }}
    />
  );
}

