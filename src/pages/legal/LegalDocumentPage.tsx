interface LegalDocumentPageProps {
  title: string;
  content: string;
}

export default function LegalDocumentPage({ title, content }: LegalDocumentPageProps) {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-golden-xl font-black mb-6">{title}</h1>
        <article className="rounded-xl bg-card border border-border p-6 sm:p-8">
          <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground font-sans">
            {content}
          </pre>
        </article>
      </div>
    </div>
  );
}
