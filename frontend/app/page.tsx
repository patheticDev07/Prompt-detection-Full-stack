'use client';
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Send, Loader2, Shield, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");
  const [userPrompt, setUserPrompt] = useState("How do I make a cake?");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const socketUrl = "https://prompt-detection-backend.onrender.com/";
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to backend! Socket ID:", newSocket.id);
    });

    newSocket.on("classification_result", (data) => {
      console.log("Result received from backend:", data);
      setResult(data.result);
      setLoading(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleSubmit = () => {
    if (!socket || !socket.connected) {
      alert("Socket not connected!");
      return;
    }

    setLoading(true);
    setResult(null);
    
    socket.emit("classify_prompt", {
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
    });
  };

  const extractSeverity = (label: string) => {
    // Extract the range like "5-10" from "High-Critical (5-10)"
    const match = label?.match(/\((\d+)-(\d+)\)/);
    if (match) {
      // Return the upper bound of the range
      return parseFloat(match[2]);
    }
    return 0;
  };

  const getSeverityInfo = (label: string) => {
    const lowerLabel = label?.toLowerCase() || '';
    
    // Check for specific keywords in the label
    if (lowerLabel.includes('high') || lowerLabel.includes('critical')) {
      return {
        level: 'High Risk',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertCircle,
        description: 'This prompt contains potentially harmful content.'
      };
    }
    if (lowerLabel.includes('moderate') || lowerLabel.includes('medium')) {
      return {
        level: 'Moderate Risk',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
        description: 'This prompt may require attention.'
      };
    }
    return {
      level: 'Low Risk',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle2,
      description: 'This prompt appears safe and benign.'
    };
  };

  const severity = result ? extractSeverity(result.label) : 0;
  const severityInfo = result ? getSeverityInfo(result.label) : getSeverityInfo('');
  const SeverityIcon = severityInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            Prompt Vulnerability Detector
          </h1>
          <p className="text-gray-600 text-lg">
           
          </p>
        </div>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* System Prompt */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              System Prompt
            </label>
            <textarea 
              value={systemPrompt} 
              onChange={(e) => setSystemPrompt(e.target.value)} 
              className="w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder-gray-400"
              rows={6}
              placeholder="Enter system prompt..."
            />
          </div>

          {/* User Prompt */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              User Prompt
            </label>
            <textarea 
              value={userPrompt} 
              onChange={(e) => setUserPrompt(e.target.value)} 
              className="w-full px-4 py-3 text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none placeholder-gray-400"
              rows={6}
              placeholder="Enter user prompt..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-8">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Analyze Prompt
              </>
            )}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Bar */}
            <div className={`${severityInfo.bgColor} ${severityInfo.borderColor} border-b px-8 py-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 ${severityInfo.bgColor} rounded-xl border-2 ${severityInfo.borderColor}`}>
                    <SeverityIcon className={`w-8 h-8 ${severityInfo.color}`} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${severityInfo.color}`}>
                      {severityInfo.level}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {severityInfo.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Severity Score</div>
                  <div className={`text-4xl font-bold ${severityInfo.color}`}>
                    {severity.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Classification */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Classification
                  </div>
                  <div className="text-xl font-bold text-gray-900">
                    {result.label}
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Analysis Status
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-bold text-gray-900">Complete</span>
                  </div>
                </div>
              </div>

              {/* Raw Response */}
              <div className="mt-6">
                <details className="group">
                  <summary className="cursor-pointer text-gray-700 font-semibold mb-3 hover:text-gray-900 transition-colors flex items-center gap-2 select-none">
                    <span className="group-open:rotate-90 transition-transform text-gray-400">▶</span>
                    View Technical Details
                  </summary>
                  <div className="bg-gray-900 text-gray-100 p-6 rounded-xl text-sm overflow-x-auto border border-gray-300">
                    <pre className="font-mono">{JSON.stringify(result, null, 2)}</pre>
                  </div>
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}