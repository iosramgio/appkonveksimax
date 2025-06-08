import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatter';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotification';

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  const api = useApi();
  const { success: showSuccess, error: showError } = useNotification();
  
  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await api.get('/backup');
      setBackups(response.data);
    } catch (error) {
      console.error('Error fetching backups:', error);
      showError('Gagal memuat daftar backup');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBackups();
  }, []);
  
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      await api.post('/backup');
      showSuccess('Backup berhasil dibuat');
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      showError('Gagal membuat backup');
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleDownloadBackup = async (backupId) => {
    try {
      const response = await api.get(`/backup/${backupId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get backup object
      const backup = backups.find(b => b._id === backupId);
      const filename = backup ? 
        `backup_${new Date(backup.createdAt).toISOString().slice(0, 10)}.zip` : 
        'backup.zip';
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading backup:', error);
      showError('Gagal mengunduh backup');
    }
  };
  
  const handleDeleteBackup = async (backupId) => {
    try {
      await api.delete(`/backup/${backupId}`);
      showSuccess('Backup berhasil dihapus');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      showError('Gagal menghapus backup');
    }
  };
  
  const handleRestoreClick = (backup) => {
    setSelectedBackup(backup);
    setShowRestoreModal(true);
  };
  
  const handleRestoreConfirm = async () => {
    if (!selectedBackup) return;
    
    setRestoreLoading(true);
    try {
      await api.post(`/backup/${selectedBackup._id}/restore`);
      showSuccess('Restore database berhasil');
      setShowRestoreModal(false);
      fetchBackups();
    } catch (error) {
      console.error('Error restoring backup:', error);
      showError('Gagal melakukan restore database');
    } finally {
      setRestoreLoading(false);
      setSelectedBackup(null);
    }
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFile(e.target.files[0]);
    }
  };
  
  const handleUploadClick = () => {
    setShowUploadModal(true);
  };
  
  const handleUploadBackup = async () => {
    if (!uploadFile) {
      showError('Pilih file backup terlebih dahulu');
      return;
    }
    
    setUploadLoading(true);
    
    const formData = new FormData();
    formData.append('backupFile', uploadFile);
    
    try {
      await api.post('/backup/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      showSuccess('Backup berhasil diunggah');
      setShowUploadModal(false);
      setUploadFile(null);
      fetchBackups();
    } catch (error) {
      console.error('Error uploading backup:', error);
      showError('Gagal mengunggah file backup');
    } finally {
      setUploadLoading(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Backup & Restore Database</h1>
        <div className="flex gap-3">
          <Button
            label="Unggah Backup"
            variant="outline"
            onClick={handleUploadClick}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            }
          />
          <Button
            label="Buat Backup"
            onClick={handleCreateBackup}
            loading={isBackingUp}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            }
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b">
          <h2 className="text-lg font-medium">Daftar Backup</h2>
        </div>
        
        {loading ? (
          <div className="p-6 animate-pulse space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : backups.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">Belum ada backup yang tersedia.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {backups.map((backup) => (
              <li key={backup._id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Backup {formatDate(backup.createdAt, true)}</h3>
                    <p className="text-sm text-gray-600">
                      Ukuran: {(backup.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      label="Download"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadBackup(backup._id)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      }
                    />
                    <Button
                      label="Restore"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreClick(backup)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                      }
                    />
                    <Button
                      label="Hapus"
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteBackup(backup._id)}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      }
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Upload Backup Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Unggah Backup"
      >
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Backup
            </label>
            <input
              type="file"
              accept=".zip,.json"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              File backup harus dalam format .zip atau .json
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              label="Batal"
              variant="outline"
              onClick={() => setShowUploadModal(false)}
            />
            <Button
              label="Unggah"
              onClick={handleUploadBackup}
              loading={uploadLoading}
              disabled={!uploadFile}
            />
          </div>
        </div>
      </Modal>
      
      {/* Restore Confirmation Modal */}
      <Modal
        isOpen={showRestoreModal}
        onClose={() => setShowRestoreModal(false)}
        title="Konfirmasi Restore Database"
      >
        <div className="p-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Peringatan
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Restore database akan menimpa seluruh data saat ini dengan data dari backup.
                    Tindakan ini tidak dapat dibatalkan. Pastikan Anda telah membuat backup
                    terbaru sebelum melakukan restore.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="mb-6">
            Apakah Anda yakin ingin melakukan restore database dengan backup dari
            {selectedBackup && (
              <span className="font-medium">
                {' ' + formatDate(selectedBackup.createdAt, true)}
              </span>
            )}?
          </p>
          
          <div className="flex justify-end gap-3">
            <Button
              label="Batal"
              variant="outline"
              onClick={() => setShowRestoreModal(false)}
            />
            <Button
              label="Restore"
              variant="danger"
              onClick={handleRestoreConfirm}
              loading={restoreLoading}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BackupRestore;