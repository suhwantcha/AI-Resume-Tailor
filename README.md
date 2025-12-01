# AI Resume Tailor

The AI Resume Tailor is a browser-based single-page application designed to empower job seekers by efficiently customizing their resumes for specific job postings. It automates resume analysis and rewriting using large language models, significantly reducing manual effort and enhancing application success rates.

## Key Features:

*   **Effortless Customization:** Input your original resume (PDF, DOCX, or paste text) and a job description.
*   **AI-Powered Generation:** Utilizes OpenAI's language models to generate tailored resumes, along with clear explanations of changes and a side-by-side diff viewer.
*   **Secure API Key Management:** Your OpenAI API key is securely stored client-side in local storage.
*   **Version Control & Export:** Manage multiple tailored resume versions and export them as Markdown, PDF, or DOCX.
*   **User-Friendly Interface:** A responsive two-column layout for seamless input, generation, and review.

## Tech Stack Highlights:

*   **Frontend:** Vite, React, TypeScript
*   **State Management:** Zustand
*   **Styling:** Tailwind CSS
*   **AI Integration:** OpenAI API
*   **Document Handling:** `pdfjs-dist`, `mammoth`, `@react-pdf/renderer`, `docx`

---

**Note:** This application is client-side only. Your data and API key are stored locally in your browser's local storage and are transmitted directly to the OpenAI API during generation.