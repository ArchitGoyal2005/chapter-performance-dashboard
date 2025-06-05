//Chapter controller typings
interface ChapterQuery {
  class?: string;
  unit?: string;
  status?: string;
  subject?: string;
  weakChapters?: string;
  page?: string;
  limit?: string;
}

interface ChapterFilters {
  class?: string;
  unit?: string;
  status?: string;
  subject?: string;
  isWeakChapter?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
  received: any;
}

export { ChapterQuery, ChapterFilters, ValidationError };
