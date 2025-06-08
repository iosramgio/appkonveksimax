import React, { useState, useRef } from 'react';
import { formatFileSize } from '../../utils/formatter';

/**
 * Reusable file upload component
 */
const FileUpload = ({
  id,
  name,
  label,
  onChange,
  onBlur,
  accept,
  multiple = false,
  maxSize = 5242880, // 5MB default
  disabled = false,
  required = false,
  error,
  helperText,
  className = '',
  inputClassName = '',
  labelClassName = '',
  errorClassName = '',
  helperClassName = '',
  fullWidth = true,
  buttonLabel = 'Pilih File',
  dropzoneLabel = 'atau drag & drop file disini',
  showPreview = true,
  previewType = 'thumbnail', // 'thumbnail' or 'list'
  maxFiles = 5,
  value = null,
  icon,
  ...props
}) => {
  // Generate an ID if not provided
  const inputId = id || `file-${name}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Component state
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  
  // References
  const inputRef = useRef(null);
  const dropzoneRef = useRef(null);
  
  // Handle file selection change
  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    processFiles(selectedFiles);
  };
  
  // Process and validate files
  const processFiles = (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const newFiles = [];
    const newErrors = [];
    const existingFileNames = files.map(f => f.name);
    
    // Convert FileList to array and process each file
    Array.from(selectedFiles).forEach(file => {
      // Check file size
      if (file.size > maxSize) {
        newErrors.push({
          file: file.name,
          error: `File terlalu besar. Maksimal ${formatFileSize(maxSize)}`
        });
        return;
      }
      
      // Check file type if specified
      if (accept && !isFileTypeAccepted(file, accept)) {
        newErrors.push({
          file: file.name,
          error: `Tipe file tidak didukung. Hanya menerima ${accept}`
        });
        return;
      }
      
      // Check for duplicate files
      if (existingFileNames.includes(file.name)) {
        newErrors.push({
          file: file.name,
          error: 'File dengan nama yang sama sudah ada'
        });
        return;
      }
      
      // Add preview URL for images
      if (file.type.startsWith('image/')) {
        file.preview = URL.createObjectURL(file);
      }
      
      newFiles.push(file);
    });
    
    // Check max files limit
    if (!multiple && newFiles.length > 0) {
      // For single file upload, replace existing file
      setFiles([newFiles[0]]);
      
      if (onChange) {
        onChange({
          target: {
            name,
            value: newFiles[0],
            files: [newFiles[0]]
          }
        });
      }
    } else {
      // For multiple files, add to existing files up to the max limit
      const combinedFiles = [...files, ...newFiles].slice(0, maxFiles);
      setFiles(combinedFiles);
      
      if (onChange) {
        onChange({
          target: {
            name,
            value: combinedFiles,
            files: combinedFiles
          }
        });
      }
    }
    
    // Set any errors
    if (newErrors.length > 0) {
      setFileErrors(newErrors);
    }
  };
  
  // Check if file type is accepted
  const isFileTypeAccepted = (file, acceptString) => {
    if (!acceptString) return true;
    
    const acceptTypes = acceptString.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
    
    return acceptTypes.some(type => {
      // Check MIME type
      if (type.includes('/')) {
        // Handle wildcards like 'image/*'
        if (type.endsWith('*')) {
          const baseType = type.split('/')[0];
          return fileType.startsWith(`${baseType}/`);
        }
        return type === fileType;
      }
      // Check file extension
      return type === fileExtension;
    });
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };
  
  // Trigger file input click
  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };
  
  // Remove a file from the list
  const removeFile = (index) => {
    const newFiles = [...files];
    
    // Release object URL if it's an image with preview
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: multiple ? newFiles : newFiles[0] || null,
          files: newFiles
        }
      });
    }
  };
  
  // Render file preview based on type
  const renderPreview = () => {
    if (!showPreview || files.length === 0) return null;
    
    if (previewType === 'thumbnail') {
      return (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <div className="aspect-w-1 aspect-h-1 rounded overflow-hidden shadow-sm border border-gray-200">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="aspect-w-1 aspect-h-1 rounded bg-gray-50 border border-gray-200 flex items-center justify-center p-2 shadow-sm">
                  <div className="text-center">
                    <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-0 right-0 mt-1 mr-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600 transition-colors"
                aria-label="Remove file"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      );
    } else {
      // List view
      return (
        <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between py-2 px-3 bg-white hover:bg-gray-50">
              <div className="flex items-center">
                {file.type.startsWith('image/') ? (
                  <img src={file.preview} alt={file.name} className="h-10 w-10 object-cover rounded" />
                ) : (
                  <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-600"
                aria-label="Remove file"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      );
    }
  };
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId} 
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      
      {/* Hidden file input */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        name={name}
        onChange={handleFileChange}
        onBlur={onBlur}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        required={required}
        className="hidden"
        {...props}
      />
      
      {/* Dropzone */}
      <div
        ref={dropzoneRef}
        className={`
          border-2 border-dashed rounded-md p-6 text-center
          ${dragActive ? 'border-[#620000] bg-[#620000]/5' : 'border-gray-300 bg-gray-50'}
          ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          ${inputClassName}
        `}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        {icon || (
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        
        <div className="mt-4 flex text-sm text-gray-600 flex-col items-center">
          <button
            type="button"
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            onClick={(e) => {
              e.stopPropagation();
              onButtonClick();
            }}
          >
            {buttonLabel}
          </button>
          <p className="pl-1">{dropzoneLabel}</p>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          {accept ? `Tipe file: ${accept}` : ''}
          {accept && maxSize ? ' | ' : ''}
          {maxSize ? `Ukuran maksimal: ${formatFileSize(maxSize)}` : ''}
        </p>
      </div>
      
      {/* File preview */}
      {renderPreview()}
      
      {/* File errors */}
      {fileErrors.length > 0 && (
        <div className="mt-3">
          {fileErrors.map((fileError, index) => (
            <p key={index} className="text-xs text-red-600">
              {fileError.file}: {fileError.error}
            </p>
          ))}
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <p 
          className={`mt-1 text-xs text-red-600 ${errorClassName}`}
        >
          {error}
        </p>
      )}
      
      {/* Helper text */}
      {helperText && !error && (
        <p 
          className={`mt-1 text-xs text-gray-500 ${helperClassName}`}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};

export default FileUpload;