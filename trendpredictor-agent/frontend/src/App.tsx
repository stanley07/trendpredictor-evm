import { useEffect, useState } from 'react';

interface TrendData {
  timestamp: string;
  headlines: string[];
  analysis: string | { headlines: string[]; analysis: string };
}

function App() {
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<TrendData | null>(null);

  useEffect(() => {
    async function fetchTrends() {
      try {
        const response = await fetch('http://localhost:3001/trends');
        const data = await response.json();
        setTrends(data);
      } catch (err) {
        console.error('Error fetching trends:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTrends();
  }, []);

  const renderHeadline = (headline: string, index: number) => {
    const [rawTitle, sourceInfo] = headline.split(' - Source: ');
    const urlMatch = rawTitle.match(/(https?:\/\/[^\s]+)/);
    const url = urlMatch?.[0];
    const cleanTitle = url ? rawTitle.replace(url, '').trim() : rawTitle;

    return (
      <li key={index} className="mb-2">
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {cleanTitle}
          </a>
        ) : (
          cleanTitle
        )}
        {sourceInfo && (
          <span className="text-sm text-gray-500 ml-2">— Source: {sourceInfo}</span>
        )}
      </li>
    );
  };

  const renderAnalysis = (text: string) => {
    const normalized = text.replace(/\r\n/g, '\n').replace(/\n{2,}/g, '\n\n');
  
    const sectionRegex = /(?:^|\n)(\d\.\s+.*?)(?=\n\d\.|\n?$)/gs;
    const sections = Array.from(normalized.matchAll(sectionRegex));
  
    return (
      <div className="space-y-6">
        {sections.map(([, section]) => {
          const [titleLine, ...rest] = section.trim().split('\n');
          const title = titleLine.replace(/^\d\.\s*/, '');
          const body = rest.join('\n');
  
          return (
            <div key={title}>
              <h3 className="text-lg font-bold mb-1">{title}</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm whitespace-pre-wrap">{body}</pre>
            </div>
          );
        })}
      </div>
    );
  };
  

  return (
    <div className="p-6 text-gray-800 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 TrendPredictor Agent</h1>
      {loading && <p>Loading trends...</p>}

      {trends && (
        <>
          <p className="text-sm text-gray-500 mb-2">
            Last updated: {new Date(trends.timestamp).toLocaleString()}
          </p>

          <h2 className="text-xl font-semibold mt-4">📰 Headlines:</h2>
          <ul className="list-disc ml-6 mb-4">
            {trends.headlines.map(renderHeadline)}
          </ul>

          <h2 className="text-xl font-semibold mt-4">📊 AI Analysis:</h2>
          {typeof trends.analysis === 'string'
            ? renderAnalysis(trends.analysis)
            : renderAnalysis(trends.analysis.analysis)}
        </>
      )}
    </div>
  );
}

export default App;
