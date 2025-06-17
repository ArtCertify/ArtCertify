import React, { useState } from 'react';

interface OrganizationInfo {
  name: string;
  code: string;
  type: string;
  city: string;
}

interface OrganizationDataProps {
  data: OrganizationInfo;
  onUpdate: (data: OrganizationInfo) => void;
  className?: string;
}

export const OrganizationData: React.FC<OrganizationDataProps> = ({ 
  data, 
  onUpdate, 
  className = "" 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);

  const handleChange = (field: keyof OrganizationInfo, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  return (
    <div className={`bg-slate-800 rounded-lg border border-slate-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-white mb-4">
        Dati Organizzazione
      </h3>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Nome</label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Codice</label>
            <input
              type="text"
              value={editData.code}
              onChange={(e) => handleChange('code', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Tipo</label>
            <input
              type="text"
              value={editData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Città</label>
            <input
              type="text"
              value={editData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Salva
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
            >
              Annulla
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Nome</span>
            <span className="text-blue-400 font-medium">{data.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Codice</span>
            <span className="text-blue-400 font-medium">{data.code}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Tipo</span>
            <span className="text-blue-400 font-medium">{data.type}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Città</span>
            <span className="text-blue-400 font-medium">{data.city}</span>
          </div>
          
          <button 
            type="button"
            onClick={() => setIsEditing(true)}
            className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Modifica
          </button>
        </div>
      )}
    </div>
  );
}; 