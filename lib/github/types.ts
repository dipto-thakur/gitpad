// lib/github/types.ts

export interface GhRepo {
    id: number;
    name: string;
    full_name: string;
    private: boolean;
    default_branch: string;
    updated_at: string;
    owner: {
      login: string;
    };
  }
  
  export interface GhBranch {
    name: string;
    protected: boolean;
  }
  
  export interface GhContentItem {
    name: string;
    path: string;
    sha: string;
    size?: number;
    type: 'file' | 'dir' | 'symlink' | 'submodule';
    content?: string;
  }
  
  export interface GhCommitResponse {
    content: {
      sha: string;
    } | null;
    commit: {
      sha: string;
    };
  }
  
  export interface GhContributionsData {
    viewer: {
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number;
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
            }[];
          }[];
        };
      };
    };
  }