import React, { useRef } from 'react';
import { useAppStore } from '../store';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import * as pdfjs from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import OpenAI from 'openai';

// Set up PDF.js worker source from local file
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

const InputColumn = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    apiKey,
    setApiKey,
    originalResume,
    setOriginalResume,
    jobDescription,
    setJobDescription,
    selectedModel,
    setSelectedModel,
    isLoading, // Read isLoading from store
    setIsLoading,
    setError,
    addGeneratedVersion,
    clearState, // Import clearState action
  } = useAppStore();

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearState();
    }
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjs.getDocument(arrayBuffer);
        const pdf = await loadingTask.promise;
        let textContent = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent += text.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setOriginalResume(textContent);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToMarkdown({ arrayBuffer: arrayBuffer });
        setOriginalResume(result.value);
      } else {
        setError('Unsupported file type. Please upload a PDF, DOCX, or paste text.');
      }
    } catch (err: any) {
      setError(`Failed to parse file: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError('Please provide an OpenAI API Key.');
      return;
    }
    if (!originalResume || !jobDescription) {
      setError('Please provide both resume and job description.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const systemPrompt = `You are an expert resume editor. Your task is to tailor the provided resume to perfectly match the given job description.
Analyze the job description to identify key skills, experiences, and keywords.
Rewrite the resume to highlight these aspects. Adjust phrasing, add relevant details, and reorder sections if necessary to make the applicant a strong candidate.
The tailored resume should be well-structured and readable, using Markdown for formatting (e.g., headings, bullet points, bolding).
After tailoring the resume, provide a brief explanation of the key changes you made and why you made them, referencing the job description. The explanation should also be in Markdown, preferably as a bulleted list.
Respond with a JSON object containing two keys: "tailoredResume" and "explanation". Both values should be Markdown strings.`;

    try {
      const response = await openai.chat.completions.create({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Original Resume:\n${originalResume}\n\nJob Description:\n${jobDescription}` },
        ],
        response_format: { type: "json_object" },
      });

      const result = response.choices[0].message?.content;
      if (!result) {
        throw new Error('No content in API response.');
      }

      const parsedResult = JSON.parse(result);
      const { tailoredResume, explanation } = parsedResult;

      if (!tailoredResume || !explanation) {
        throw new Error('Invalid JSON structure in API response.');
      }

      addGeneratedVersion({
        id: Date.now().toString(),
        tailoredResume,
        explanation,
        // The diff content is now handled by the diff viewer component directly
        diff: '', 
        createdAt: Date.now(),
      });

    } catch (err: any) {
      setError(`Generation failed: ${err.name} - ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label>Original Resume (PDF, DOCX or Paste Text)</Label>
        <div className="flex gap-2 mb-2">
          <Button onClick={handleUploadButtonClick} variant="outline" className="w-full">
            Upload Resume File
          </Button>
        </div>
        <Input 
          id="resume-upload" 
          type="file" 
          accept=".pdf,.docx" 
          onChange={handleFileUpload} 
          className="hidden" 
          ref={fileInputRef} 
        />
        <Textarea
          placeholder="Or paste your original resume here..."
          value={originalResume}
          onChange={(e) => setOriginalResume(e.target.value)}
          rows={10}
        />
      </div>

      <div>
        <Label htmlFor="job-description">Job Description</Label>
        <Textarea
          id="job-description"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key">OpenAI API Key</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="sk-..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="model-select">Select Model</Label>
        <Select value={selectedModel} onValueChange={setSelectedModel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
            <SelectItem value="gpt-4o">gpt-4o</SelectItem>
            <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
        {isLoading ? 'Generating...' : 'Generate Tailored Resume'}
      </Button>
      <Button onClick={handleClearData} variant="destructive" className="w-full">
        Clear All Data
      </Button>
    </div>
  );
};

export default InputColumn;
