export interface Country {
    id: number;
    name: string;
    code: string;
}

export interface Customer {
    id: number;
    full_name: string;
    email: string;
    phone_number: string;
    address: string;
    birth_date: string;
    nationality: string | 'wni' | 'wna';
    country_id: number | null;
    countries?: null | Country; 
    photo_url?: string;
    created_by: string;
    created_at?: string;
    updated_at?: string;
}

export interface CustomerInput extends Omit<Customer, 'id' | 'created_by' | 'created_at' | 'updated_at'> {}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}