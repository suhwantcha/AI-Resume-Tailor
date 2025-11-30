import React from 'react';
import { useAppStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea'; // Added missing import
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { Packer, Document as DocxDocument, Paragraph, TextRun } from "docx";
import DiffViewer from '@alexbruf/react-diff-viewer'; // Updated import
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const OutputColumn = () => {
  const { generatedVersions, isLoading, error, originalResume } = useAppStore();
  const [selectedVersionId, setSelectedVersionId] = React.useState<string | null>(null);

  const selectedVersion = generatedVersions.find(
    (version) => version.id === selectedVersionId
  );

  React.useEffect(() => {
    if (generatedVersions.length > 0) {
      const latestVersionId = generatedVersions[generatedVersions.length - 1].id;
      setSelectedVersionId(latestVersionId);
    }
  }, [generatedVersions]);

  const handleDownloadMarkdown = () => {
    if (selectedVersion) {
      const blob = new Blob([selectedVersion.tailoredResume], { type: 'text/markdown' });
      saveAs(blob, `tailored_resume_${selectedVersion.id}.md`);
    }
  };

  const handleDownloadPdf = async () => {
    if (selectedVersion) {
      const styles = StyleSheet.create({
        page: { padding: 30 },
        section: { margin: 10, padding: 10, flexGrow: 1 },
        text: { fontSize: 12 },
      });

      const MyDocument = (
        <Document>
          <Page size="A4" style={styles.page}>
            <View style={styles.section}>
              <Text style={styles.text}>{selectedVersion.tailoredResume}</Text>
            </View>
          </Page>
        </Document>
      );

      const blob = await pdf(MyDocument).toBlob();
      saveAs(blob, `tailored_resume_${selectedVersion.id}.pdf`);
    }
  };

  const handleDownloadDocx = async () => {
    if (selectedVersion) {
      const doc = new DocxDocument({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun(selectedVersion.tailoredResume),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `tailored_resume_${selectedVersion.id}.docx`);
    }
  };


  return (
    <div className="flex flex-col h-full space-y-4">
      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {generatedVersions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {generatedVersions.map((version) => (
                <Button
                  key={version.id}
                  variant={version.id === selectedVersionId ? 'default' : 'outline'}
                  onClick={() => setSelectedVersionId(version.id)}
                >
                  Version {version.id.substring(version.id.length - 4)}
                </Button>
              ))}
            </div>

            {selectedVersion && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Tailored Resume</h3>
                <Card className="p-4 prose dark:prose-invert max-w-full h-96 overflow-y-auto">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedVersion.tailoredResume}</ReactMarkdown>
                </Card>

                <Separator />

                <h3 className="text-xl font-semibold">Explanation of Changes</h3>
                <Card className="p-4 prose dark:prose-invert max-w-full">
                   <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedVersion.explanation}</ReactMarkdown>
                </Card>

                <Separator />

                <h3 className="text-xl font-semibold">Side-by-Side Diff</h3>
                <div className="overflow-x-auto">
                  <DiffViewer
                    oldValue={originalResume}
                    newValue={selectedVersion.tailoredResume}
                    splitView={true}
                    showDiffOnly={false}
                    styles={{
                      lineContent: {
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                      }
                    }}
                  />
                </div>

                <Separator />

                <h3 className="text-xl font-semibold">Download</h3>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadMarkdown}>Download as Markdown</Button>
                  <Button onClick={handleDownloadPdf}>Download as PDF</Button>
                  <Button onClick={handleDownloadDocx}>Download as DOCX</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OutputColumn;
