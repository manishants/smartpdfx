
"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { createPost } from '@/app/actions/blog';
import { Loader2, Sparkles, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Maximize, Code, Eye, Link, List, ListOrdered, Quote, ChevronsRight, Trash2, PlusCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export function CreatePostForm() {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const [origin, setOrigin] = useState('');
    
    // State for the form fields
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [author, setAuthor] = useState('');
    const [slug, setSlug] = useState('');
    const [seoTitle, setSeoTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [published, setPublished] = useState('true');
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [activeFormats, setActiveFormats] = useState<string[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setOrigin(window.location.origin);
        }
    }, []);

    useEffect(() => {
        if (!seoTitle && title) {
            setSeoTitle(title);
        }
        if (!slug && title) {
            setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''));
        }
    }, [title, seoTitle, slug]);
    
     useEffect(() => {
        if (editorRef.current && content !== editorRef.current.innerHTML) {
            editorRef.current.innerHTML = content;
        }
    }, [content]);

    useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;

        const handleSelectionChange = () => {
            const newActiveFormats: string[] = [];
            const formats = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList'];
            formats.forEach(format => {
                if (document.queryCommandState(format)) {
                    newActiveFormats.push(format);
                }
            });
            const blockFormat = document.queryCommandValue('formatBlock').toLowerCase();
            if (['h1', 'h2', 'h3', 'p'].includes(blockFormat)) {
                newActiveFormats.push(blockFormat);
            } else {
                 newActiveFormats.push('p');
            }
            setActiveFormats(newActiveFormats);
        };

        const handleClick = () => {
            handleSelectionChange();
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        editor.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            editor.removeEventListener('click', handleClick);
        };
    }, []);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData(event.currentTarget);
        formData.set('title', title);
        formData.set('content', content);
        formData.set('author', author);
        formData.set('slug', slug);
        formData.set('seoTitle', seoTitle);
        formData.set('metaDescription', metaDescription);
        formData.set('published', published);
        faqs.forEach((faq, index) => {
            formData.set(`faq-question-${index}`, faq.question);
            formData.set(`faq-answer-${index}`, faq.answer);
        });


        const result = await createPost(formData);

        if (result?.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Your blog post has been created!",
            });
            // Reset form and state
            formRef.current?.reset();
            setTitle('');
            setContent('');
            setAuthor('');
            setSlug('');
            setSeoTitle('');
            setMetaDescription('');
            setFaqs([]);
        }

        setIsLoading(false);
    };
    
    const handleFormat = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    }

    const addFaq = () => {
      setFaqs([...faqs, { id: Date.now(), question: '', answer: '' }]);
    };

    const removeFaq = (id: number) => {
      setFaqs(faqs.filter(faq => faq.id !== id));
    };

    const updateFaq = (id: number, field: 'question' | 'answer', value: string) => {
      setFaqs(faqs.map(faq => faq.id === id ? { ...faq, [field]: value } : faq));
    };
    
    const blockFormatDisplay = {
        'h1': 'H1',
        'h2': 'H2',
        'h3': 'H3',
        'p': 'P',
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-6">
            <style jsx global>{`
                .prose a {
                    color: #3b82f6;
                    text-decoration: underline;
                }
            `}</style>
            {/* Main Content (Left Column) */}
            <div className="lg:col-span-9 space-y-6">
                 <Card>
                    <CardContent className="p-4">
                        <Input
                            id="title"
                            name="title"
                            placeholder="Post Title"
                            className="text-2xl font-bold h-14 border-none focus-visible:ring-0 shadow-none"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <div className="p-2 border-b flex flex-wrap items-center gap-1">
                             <Popover>
                                 <PopoverTrigger asChild>
                                     <Button type="button" variant="ghost" className="w-20">
                                         {blockFormatDisplay[activeFormats.find(f => ['h1', 'h2', 'h3', 'p'].includes(f)) || 'p']}
                                         <ChevronDown className="ml-2 h-4 w-4"/>
                                     </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-32 p-1">
                                     <Button variant="ghost" className="w-full justify-start" onClick={() => handleFormat('formatBlock', '<p>')}>Paragraph</Button>
                                     <Button variant="ghost" className="w-full justify-start text-2xl font-bold" onClick={() => handleFormat('formatBlock', '<h1>')}>H1</Button>
                                     <Button variant="ghost" className="w-full justify-start text-xl font-bold" onClick={() => handleFormat('formatBlock', '<h2>')}>H2</Button>
                                     <Button variant="ghost" className="w-full justify-start text-lg font-bold" onClick={() => handleFormat('formatBlock', '<h3>')}>H3</Button>
                                 </PopoverContent>
                             </Popover>
                             <div className="h-6 border-l mx-2"></div>
                             <Button type="button" variant={activeFormats.includes('bold') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleFormat('bold')}><Bold className="h-4 w-4"/></Button>
                             <Button type="button" variant={activeFormats.includes('italic') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleFormat('italic')}><Italic className="h-4 w-4"/></Button>
                             <Button type="button" variant={activeFormats.includes('underline') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleFormat('underline')}><Underline className="h-4 w-4"/></Button>
                             <Button type="button" variant={activeFormats.includes('strikeThrough') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleFormat('strikeThrough')}><Strikethrough className="h-4 w-4"/></Button>
                             <div className="h-6 border-l mx-2"></div>
                             <Button type="button" variant={activeFormats.includes('insertUnorderedList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleFormat('insertUnorderedList')}><List className="h-4 w-4"/></Button>
                             <Button type="button" variant={activeFormats.includes('insertOrderedList') ? 'secondary' : 'ghost'} size="icon" className="h-8 w-8" onClick={() => handleFormat('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
                             <div className="h-6 border-l mx-2"></div>
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('formatBlock', '<blockquote>')}><Quote className="h-4 w-4" /></Button>
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleFormat('formatBlock', '<pre>')}><Code className="h-4 w-4" /></Button>
                             <div className="h-6 border-l mx-2"></div>
                             <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { const url = prompt('Enter a URL:'); if (url) handleFormat('createLink', url); }}><Link className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <div 
                            ref={editorRef}
                            id="content-editor"
                            contentEditable={true}
                            onInput={e => setContent(e.currentTarget.innerHTML)}
                            className="w-full min-h-[400px] p-4 focus:outline-none rounded-b-lg prose dark:prose-invert max-w-none"
                         >
                         </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar (Right Column) */}
            <div className="lg:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Publish</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="author">Author</Label>
                             <Input id="author" name="author" required value={author} onChange={e => setAuthor(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="image">Featured Image</Label>
                            <Input id="image" name="image" type="file" required accept="image/*" />
                        </div>
                         <div className="space-y-2">
                           <Label htmlFor="status">Status</Label>
                           <Select name="published" value={published} onValueChange={setPublished}>
                                <SelectTrigger id="status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Published</SelectItem>
                                    <SelectItem value="false">Draft</SelectItem>
                                </SelectContent>
                           </Select>
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full">
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Publishing...</> : "Publish Post"}
                        </Button>
                    </CardContent>
                </Card>

                 <Accordion type="single" collapsible defaultValue="seo">
                    <AccordionItem value="seo">
                        <AccordionTrigger className="text-base font-semibold px-6">SEO & SERP Preview</AccordionTrigger>
                        <AccordionContent className="p-6 pt-2 space-y-4">
                            {/* SERP Preview */}
                            <div>
                                <Label className="font-semibold">Preview</Label>
                                <div className="p-3 border rounded-lg mt-2 bg-muted/20">
                                    <p className="text-blue-700 text-lg truncate dark:text-blue-400">{seoTitle || "Your SEO Title Here"}</p>
                                    <p className="text-green-600 text-sm truncate dark:text-green-400">{origin && (slug ? `${origin}/blog/${slug}` : `${origin}/blog/...`)}</p>
                                    <p className="text-sm text-gray-600 line-clamp-2 dark:text-gray-400">{metaDescription || "Your meta description will appear here. Write a compelling summary to attract readers."}</p>
                                </div>
                            </div>
                           <div className="space-y-2">
                                <Label htmlFor="seoTitle">SEO Title</Label>
                                <Input id="seoTitle" name="seoTitle" value={seoTitle} onChange={e => setSeoTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="metaDescription">Meta Description</Label>
                                <Textarea id="metaDescription" name="metaDescription" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input id="slug" name="slug" value={slug} onChange={e => setSlug(e.target.value)} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="faq">
                         <AccordionTrigger className="text-base font-semibold px-6">FAQ Schema</AccordionTrigger>
                        <AccordionContent className="p-6 pt-2 space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={faq.id} className="p-3 border rounded-md space-y-2 relative">
                                    <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeFaq(faq.id)}><Trash2 className="h-4 w-4"/></Button>
                                    <div className="space-y-1">
                                        <Label htmlFor={`faq-q-${index}`}>Question</Label>
                                        <Input id={`faq-q-${index}`} value={faq.question} onChange={(e) => updateFaq(faq.id, 'question', e.target.value)} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor={`faq-a-${index}`}>Answer</Label>
                                        <Textarea id={`faq-a-${index}`} value={faq.answer} onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)} />
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" className="w-full" onClick={addFaq}><PlusCircle className="mr-2"/>Add FAQ</Button>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </form>
    );
}

    

    