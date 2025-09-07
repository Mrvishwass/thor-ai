import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { uploadImage } from '../api';

const XrayDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [highlights, setHighlights] = useState([]);
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setHighlights([]);
        setPrediction('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
  if (!selectedFile) return;
  setIsAnalyzing(true);
  try {
    const response = await uploadImage(selectedFile);
    setPrediction(response.prediction);
    setHighlights(response.highlights || []); // get rectangles
  } catch (err) {
    console.error(err);
    alert('Analysis failed. Please try again.');
  } finally {
    setIsAnalyzing(false);
  }
};



  // Draw highlights on canvas
  // Inside useEffect for drawing canvas
useEffect(() => {
  const canvas = canvasRef.current;
  if (!canvas || !preview) return;

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = preview;

  img.onload = () => {
    // Set canvas size to match displayed image
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Scale factor based on model input size
    const scaleX = canvas.width / 224;
    const scaleY = canvas.height / 224;

    ctx.strokeStyle = 'rgba(255,0,0,0.7)';
    ctx.lineWidth = 3;

    highlights.forEach((rect) => {
      ctx.strokeRect(
        rect.x * scaleX,
        rect.y * scaleY,
        rect.width * scaleX,
        rect.height * scaleY
      );
    });
  };
}, [preview, highlights]);


  return (
    <div className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">X-ray Detection</h1>
          <p className="text-lg">
            Upload a chest X-ray image for AI-powered analysis and detection
          </p>
        </div>

        {/* Upload & Preview */}
        <div className={`p-6 rounded-lg shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <input type="file" accept="image/*" onChange={handleFileSelect} className="mb-4" />
          {preview && (
            <div className="relative">
              <canvas ref={canvasRef} className="rounded-lg shadow-md" />
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                  setPrediction('');
                  setHighlights([]);
                }}
                className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || isAnalyzing}
            className="mt-4 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:text-gray-200"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze X-ray'}
          </button>

          {prediction && (
            <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-50 text-green-900'}`}>
              <h3 className="font-semibold">Prediction:</h3>
              <p className="mt-2 text-lg">{prediction}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default XrayDetection;
