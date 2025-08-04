export interface Language {
  name: string;
}

export interface LanguageResponse {
  data: Language[];
  httpStatus: string;
}