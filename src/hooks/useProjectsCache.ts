import { useCallback } from 'react';

// Cache key for localStorage
const PROJECTS_CACHE_KEY = 'artcertify_projects_cache';

// Cache interface
interface ProjectsCache {
  projects: string[];
  lastUpdated: number;
  userAddress: string;
}

/**
 * Custom hook for managing projects cache in localStorage
 * Provides functions to get, set, and clear cached project names
 */
export const useProjectsCache = () => {
  const getCachedProjects = useCallback((userAddress: string): string[] => {
    try {
      const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
      if (cached) {
        const cacheData: ProjectsCache = JSON.parse(cached);
        // Check if cache is for the same user and not too old (24 hours)
        const isExpired = Date.now() - cacheData.lastUpdated > 24 * 60 * 60 * 1000;
        if (cacheData.userAddress === userAddress && !isExpired) {
          return cacheData.projects;
        }
      }
    } catch (error) {
      console.warn('Error reading projects cache:', error);
    }
    return [];
  }, []);

  const setCachedProjects = useCallback((userAddress: string, projects: string[]) => {
    try {
      const cacheData: ProjectsCache = {
        projects,
        lastUpdated: Date.now(),
        userAddress
      };
      localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error saving projects cache:', error);
    }
  }, []);

  const clearProjectsCache = useCallback(() => {
    try {
      localStorage.removeItem(PROJECTS_CACHE_KEY);
    } catch (error) {
      console.warn('Error clearing projects cache:', error);
    }
  }, []);

  const isCacheValid = useCallback((userAddress: string): boolean => {
    try {
      const cached = localStorage.getItem(PROJECTS_CACHE_KEY);
      if (cached) {
        const cacheData: ProjectsCache = JSON.parse(cached);
        const isExpired = Date.now() - cacheData.lastUpdated > 24 * 60 * 60 * 1000;
        return cacheData.userAddress === userAddress && !isExpired;
      }
    } catch (error) {
      console.warn('Error checking cache validity:', error);
    }
    return false;
  }, []);

  return {
    getCachedProjects,
    setCachedProjects,
    clearProjectsCache,
    isCacheValid
  };
};
