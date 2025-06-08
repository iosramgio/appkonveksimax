import React, { useState } from 'react';
import FileUpload from '../forms/FileUpload';
import Button from '../common/Button';

const DesignUploader = ({ onUpload, onCancel, designFee = 0 }) => {
  const [designFile, setDesignFile] = useState(null);
  const [designNotes, setDesignNotes] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileUpload = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setDesignFile(file);
      setIsPreviewMode(true);
    }
  };
  
  const handleNotesChange = (e) => {
    setDesignNotes(e.target.value);
  };
  
  const handleSubmit = async () => {
    if (designFile) {
      try {
        setIsUploading(true);
        await onUpload({
          file: designFile,
          notes: designNotes,
          customizationFee: designFee // Gunakan nilai dari prop
        });
      } catch (error) {
        console.error("Error uploading design:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const handleCancel = () => {
    setDesignFile(null);
    setDesignNotes('');
    setIsPreviewMode(false);
    onCancel();
  };
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      {!isPreviewMode ? (
        <div className="text-center">
          <h3 className="font-medium text-lg mb-3">Upload Desain Anda</h3>
          <p className="text-gray-600 mb-6">
            Upload file desain Anda dalam format JPG, PNG, atau PDF. 
            {designFee > 0 ? 
              `Biaya tambahan design: Rp ${designFee.toLocaleString('id-ID')} per pcs` :
              "Desain custom tidak dikenakan biaya tambahan"
            }
          </p>
          
          <FileUpload
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={(e) => handleFileUpload(e.target.files)}
            label="Pilih File Desain"
            multiple={false}
          />
          
          <p className="text-xs text-gray-500 mt-4">
            Maksimum ukuran file 10MB. Untuk hasil terbaik, disarankan resolusi minimal 300dpi.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="font-medium text-lg mb-3">Preview Desain</h3>
          
          <div className="mb-4">
            {designFile.type.includes('image') ? (
              <img 
                src={URL.createObjectURL(designFile)} 
                alt="Design preview" 
                className="max-h-64 mx-auto rounded-md"
              />
            ) : (
              <div className="bg-gray-100 p-8 text-center rounded-md">
                <p className="text-gray-700 font-medium">{designFile.name}</p>
                <p className="text-gray-500 text-sm mt-2">
                  {(designFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan Desain (Opsional)
            </label>
            <textarea
              value={designNotes}
              onChange={handleNotesChange}
              rows={4}
              placeholder="Berikan keterangan atau petunjuk terkait desain anda..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Informasi biaya desain kustom */}
          {designFee > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Info biaya:</strong> Biaya desain kustom sebesar Rp {designFee.toLocaleString('id-ID')} per pcs akan ditambahkan
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <Button 
              label="Batalkan" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isUploading}
            />
            <Button 
              label={isUploading ? "Mengupload..." : "Konfirmasi Design"}
              onClick={handleSubmit}
              disabled={isUploading}
              icon={isUploading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignUploader;