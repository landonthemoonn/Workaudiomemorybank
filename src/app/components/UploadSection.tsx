import { useState, useRef } from 'react';
import { Upload, FileAudio, FileText, X, Sparkles } from 'lucide-react';

export default function UploadSection() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcess = () => {
    // This will be connected to Supabase + OpenAI API
    console.log('Processing files:', files);
    alert('Files will be processed once Supabase is connected!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upload Area */}
      <div className="space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
            dragActive
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border bg-white/40 backdrop-blur-sm hover:bg-white/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.txt,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="mb-2">Drop your files here</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Audio recordings, transcripts, or text files
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
            <div className="flex items-center justify-between mb-4">
              <h3>Ready to Process ({files.length})</h3>
              <button
                onClick={handleProcess}
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Process with AI
              </button>
            </div>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/60"
                >
                  <div className="flex items-center gap-3">
                    {file.type.startsWith('audio/') ? (
                      <FileAudio className="w-5 h-5 text-accent" />
                    ) : (
                      <FileText className="w-5 h-5 text-secondary" />
                    )}
                    <div>
                      <p className="text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="space-y-6">
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <h3 className="mb-4">How It Works</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">1</span>
              </div>
              <div>
                <p className="mb-1">Upload Your Work Audio</p>
                <p className="text-sm text-muted-foreground">
                  Drop audio recordings, transcripts, or text files from your Photo Studio work
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">2</span>
              </div>
              <div>
                <p className="mb-1">AI Transcription & Analysis</p>
                <p className="text-sm text-muted-foreground">
                  Audio is transcribed and analyzed to extract key information and insights
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">3</span>
              </div>
              <div>
                <p className="mb-1">Organized Memory Bank</p>
                <p className="text-sm text-muted-foreground">
                  Automatically organized by date with searchable knowledge base
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="mb-1">Draft Articles Generated</p>
                <p className="text-sm text-muted-foreground">
                  AI creates draft knowledge base articles from important discussions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-accent/20 to-primary/20 backdrop-blur-sm rounded-2xl p-6 border border-white/40">
          <h4 className="mb-2">Supported File Types</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/60 rounded-lg text-sm">.mp3</span>
            <span className="px-3 py-1 bg-white/60 rounded-lg text-sm">.wav</span>
            <span className="px-3 py-1 bg-white/60 rounded-lg text-sm">.m4a</span>
            <span className="px-3 py-1 bg-white/60 rounded-lg text-sm">.txt</span>
            <span className="px-3 py-1 bg-white/60 rounded-lg text-sm">.doc</span>
            <span className="px-3 py-1 bg-white/60 rounded-lg text-sm">.docx</span>
          </div>
        </div>
      </div>
    </div>
  );
}
