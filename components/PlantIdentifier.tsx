
import React, { useState, useCallback } from 'react';
import { analyzePlantImage } from '../services/geminiService';
import { Spinner } from './icons/Spinner';
import { UploadIcon } from './icons/UploadIcon';

// Helper function to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove prefix `data:*/*;base64,`
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

const PlantIdentifier: React.FC = () => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageData, setImageData] = useState<{ data: string, mimeType: string} | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [result, setResult] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setResult(null);
            setError(null);
            setImagePreview(URL.createObjectURL(file));
            try {
                const base64Data = await fileToBase64(file);
                setImageData({ data: base64Data, mimeType: file.type });
            } catch (err) {
                setError("Failed to read the image file.");
                setImagePreview(null);
                setImageData(null);
            }
        }
    }, []);

    const handleIdentifyClick = async () => {
        if (!imageData) {
            setError("Please upload an image first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const responseText = await analyzePlantImage(imageData.data, imageData.mimeType);
            setResult(responseText);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderFormattedResult = (text: string) => {
        const sections = text.split(/(?=## |### )/);
        return sections.map((section, index) => {
            const trimmedSection = section.trim();
            if (trimmedSection.startsWith('## ')) {
                return <h2 key={index} className="text-2xl font-bold text-green-700 mt-6 mb-2">{trimmedSection.substring(3)}</h2>;
            }
            if (trimmedSection.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold text-green-600 mt-4 mb-1">{trimmedSection.substring(4)}</h3>;
            }
            return <p key={index} className="text-gray-700 leading-relaxed whitespace-pre-wrap">{trimmedSection}</p>;
        });
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className="text-3xl font-bold text-gray-700 mb-4 text-center">Identify a Plant</h2>
            <p className="text-center text-gray-500 mb-6">Upload a photo of a plant, and our AI will identify it and provide care instructions.</p>

            <div className="w-full max-w-md">
                {!imagePreview && (
                     <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 mb-3 text-green-500" />
                            <p className="mb-2 text-sm text-green-700"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
                        </div>
                        <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                    </label>
                )}
               
                {imagePreview && (
                    <div className="mb-4 text-center">
                        <img src={imagePreview} alt="Plant preview" className="max-h-80 w-auto inline-block rounded-lg shadow-md" />
                         <button onClick={() => { setImagePreview(null); setImageData(null); setResult(null); }} className="mt-4 text-sm text-red-500 hover:text-red-700">Remove Image</button>
                    </div>
                )}
            </div>

            <button
                onClick={handleIdentifyClick}
                disabled={!imageData || isLoading}
                className="mt-4 px-8 py-3 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
            >
                {isLoading ? <Spinner /> : 'Identify Plant'}
            </button>

            {error && <p className="mt-4 text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            {result && (
                <div className="mt-8 w-full bg-gray-50 p-6 rounded-lg border border-gray-200">
                    {renderFormattedResult(result)}
                </div>
            )}
        </div>
    );
};

export default PlantIdentifier;
