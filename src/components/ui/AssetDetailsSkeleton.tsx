import React from 'react';

export const AssetDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-slate-700 rounded-lg"></div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-6 bg-slate-700 rounded-full"></div>
            <div className="w-48 h-8 bg-slate-700 rounded"></div>
          </div>
        </div>
        <div className="w-36 h-10 bg-slate-700 rounded-lg"></div>
      </div>
      
      {/* Asset Title Section */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="w-80 h-9 bg-slate-700 rounded mb-3"></div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <div className="w-16 h-6 bg-slate-700 rounded-full"></div>
              <div className="w-12 h-6 bg-slate-700 rounded-full"></div>
              <div className="w-20 h-6 bg-slate-700 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-600 rounded"></div>
            <div className="w-3/4 h-4 bg-slate-600 rounded"></div>
            <div className="w-5/6 h-4 bg-slate-600 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column - General Information */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* General Information */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-slate-700 rounded"></div>
              <div className="w-48 h-6 bg-slate-700 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={i === 4 ? 'md:col-span-2' : ''}>
                  <div className="w-32 h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="w-40 h-4 bg-slate-600 rounded"></div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-slate-600 rounded"></div>
                        <div className="w-6 h-6 bg-slate-600 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NFT Metadata */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-slate-700 rounded"></div>
              <div className="w-32 h-6 bg-slate-700 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={i === 1 ? 'md:col-span-2' : ''}>
                  <div className="w-24 h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <div className="w-full h-4 bg-slate-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IPFS Files */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-700 rounded"></div>
                <div className="w-24 h-6 bg-slate-700 rounded"></div>
              </div>
              <div className="w-12 h-6 bg-slate-700 rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="border border-slate-600 rounded-lg p-4 bg-slate-800/50">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-5 h-5 bg-slate-700 rounded"></div>
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-slate-700 rounded mb-1"></div>
                      <div className="w-24 h-3 bg-slate-700 rounded"></div>
                    </div>
                  </div>

                  {/* Preview */}
                  {i === 0 && (
                    <div className="mb-3">
                      <div className="w-32 h-20 bg-slate-700 rounded"></div>
                    </div>
                  )}

                  {/* CID */}
                  <div className="mb-3">
                    <div className="w-16 h-3 bg-slate-700 rounded mb-1"></div>
                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                      <div className="w-full h-3 bg-slate-600 rounded"></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="w-20 h-6 bg-slate-700 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Technical Details */}
        <div className="space-y-6">
          
          {/* Technical Details */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-slate-700 rounded"></div>
              <div className="w-32 h-6 bg-slate-700 rounded"></div>
            </div>
            
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i}>
                  <div className="w-24 h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                    <div className="w-32 h-4 bg-slate-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Explorer Links */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-slate-700 rounded"></div>
              <div className="w-36 h-6 bg-slate-700 rounded"></div>
            </div>
            
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="w-24 h-4 bg-slate-600 rounded mb-1"></div>
                      <div className="w-32 h-3 bg-slate-600 rounded"></div>
                    </div>
                    <div className="w-4 h-4 bg-slate-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Versioning Section */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-slate-700 rounded"></div>
          <div className="w-48 h-8 bg-slate-700 rounded"></div>
          <div className="w-20 h-6 bg-slate-700 rounded-full"></div>
        </div>

        {/* Version Cards */}
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className={`border rounded-lg p-4 ${
              i === 0 
                ? 'border-green-800 bg-green-900/20' 
                : 'border-slate-600 bg-slate-700/50'
            }`}>
              {/* Version Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${
                    i === 0 
                      ? 'bg-green-900/30 border-2 border-green-800' 
                      : 'bg-slate-600 border-2 border-slate-500'
                  }`}></div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-24 h-5 bg-slate-700 rounded"></div>
                      {i === 0 && (
                        <div className="w-16 h-5 bg-green-900/30 border border-green-800 rounded"></div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-4 bg-slate-700 rounded"></div>
                      <div className="w-24 h-4 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-24 h-5 bg-blue-900/30 border border-blue-800 rounded"></div>
                  <div className="w-5 h-5 bg-slate-700 rounded"></div>
                </div>
              </div>

              {/* Changes Summary */}
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-16 h-5 bg-slate-600/50 border border-slate-500 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-700 rounded"></div>
            <div className="w-96 h-4 bg-slate-700 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 