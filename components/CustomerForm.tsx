'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CustomerSchema } from '@/utils/validation';
import { Country, CustomerInput } from '@/types/database.types';
import SearchableSelect from './SearchableSelect';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface CustomerFormProps {
    initialValues: CustomerInput;
    onSubmit: (values: any) => void;
    isEditing?: boolean;
    isSubmitting?: boolean;
}

export default function CustomerForm({ initialValues, onSubmit, isEditing = false, isSubmitting = false }: CustomerFormProps) {
    const [form, setForm] = useState(initialValues);
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialValues.photo_url || null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [countries, setCountries] = useState<Country[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isPhotoChanged, setIsPhotoChanged] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('/api/countries');
                const data = await response.json();
                setCountries(data.data || []);
            } catch (error) {
                console.error('Error fetching countries:', error);
            } finally {
                setIsLoadingCountries(false);
            }
        };

        fetchCountries();
    }, []);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === 'nationality' && value === 'wni') {
            setForm((prev) => ({ ...prev, country_id: null }));
        }

        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setErrors(prev => ({
                ...prev,
                photo: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
            }));
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            setErrors(prev => ({
                ...prev,
                photo: 'Image size should be less than 5MB'
            }));
            return;
        }

        try {
            // Clear any previous errors
            setErrors(prev => ({ ...prev, photo: '' }));

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Store the file
            setPhotoFile(file);
            setIsPhotoChanged(true);
            setForm(prev => ({ ...prev, photo_url: file.name }));
        } catch (error) {
            console.error('Error processing image:', error);
            setErrors(prev => ({
                ...prev,
                photo: 'Error processing image. Please try again.'
            }));
        }
    };

    const removePhoto = () => {
        setPhotoPreview(null);
        setPhotoFile(null);
        setIsPhotoChanged(true);
        setForm(prev => ({ ...prev, photo_url: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate with Zod
        const validation = CustomerSchema.safeParse(form);

        console.log(form)

        if (!validation.success) {
            const fieldErrors: Record<string, string> = {};
            validation.error.errors.forEach((error) => {
                if (error.path[0]) {
                    fieldErrors[error.path[0] as string] = error.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        // If there's a photo file, upload it first
        try {
            let photoUrl = form.photo_url;
            if (photoFile && isPhotoChanged) {
                const formData = new FormData();
                formData.append('file', photoFile);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                form.photo_url = data.url; // Assuming the API returns the uploaded file URL
            } else if (isPhotoChanged && !photoFile) {
                // Delete photo from storage if it was removed
                if (initialValues.photo_url) {
                    try {
                        const response = await fetch(`/api/upload?path=${encodeURIComponent(initialValues.photo_url)}`, {
                            method: 'DELETE',
                        });

                        if (!response.ok) {
                            console.error('Failed to delete photo from storage');
                        }
                    } catch (error) {
                        console.error('Error deleting photo from storage:', error);
                    }
                }
                form.photo_url = '';
            } else if (!isPhotoChanged && isEditing) {
                // If editing and photo wasn't changed, keep the original URL
                form.photo_url = initialValues.photo_url;
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            setErrors(prev => ({
                ...prev,
                photo: 'Failed to upload image. Please try again.'
            }));
            return;
        }

        onSubmit(form);
    }


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-4">
                {/* Full Name */}
                <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name <span className='text-red-500'>*</span>
                    </label>
                    <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={form.full_name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 text-gray-800 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100"
                    />
                    {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email  <span className='text-red-500'>*</span>
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 text-gray-800 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100"
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>
            </div>

            <div className='grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:gap-x-4'>
                {/* Phone Number */}
                <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone Number  <span className='text-red-500'>*</span>
                    </label>
                    <input
                        id="phone_number"
                        name="phone_number"
                        type="text"
                        value={form.phone_number}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 text-gray-800 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100"
                    />
                    {errors.phone_number && <p className="text-sm text-red-500">{errors.phone_number}</p>}
                </div>

                {/* Birth Date */}
                <div>
                    <label htmlFor="birth_date" className="block text-sm font-medium placeholder:text-gray-700 text-gray-700 dark:text-gray-300">
                        Birth Date  <span className='text-red-500'>*</span>
                    </label>
                    <input
                        id="birth_date"
                        name="birth_date"
                        type="date"
                        value={form.birth_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 text-gray-800 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100"
                    />
                    {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date}</p>}
                </div>
            </div>

            <div className={`grid grid-cols-1 gap-y-6 lg:gap-x-4 ${form.nationality === 'wna' ? 'lg:grid-cols-2' : ''}`}>
                {/* Nationality */}
                <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nationality  <span className='text-red-500'>*</span>
                    </label>
                    <select
                        id="nationality"
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        className="w-full px-4 py-2 mt-1 text-gray-800 dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100"
                    >
                        <option value="wni">WNI</option>
                        <option value="wna">WNA</option>
                    </select>
                </div>

                {/* Country Dropdown for WNA */}
                {form.nationality === 'wna' && (
                    <div>
                        <label htmlFor="country_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Country  <span className='text-red-500'>*</span>
                        </label>
                        <SearchableSelect
                            options={countries}
                            value={form.country_id}
                            onChange={(value) => setForm((prev) => ({ ...prev, country_id: value }))}
                            placeholder="Select a country"
                            isLoading={isLoadingCountries}
                            error={errors.country_id}
                        />
                        {errors.country_id && <p className="text-sm text-red-500">{errors.country_id}</p>}
                    </div>
                )}

            </div>

            {/* Address */}
            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address  <span className='text-red-500'>*</span>
                </label>
                <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 mt-1 text-black dark:text-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-blue-100 resize-none"
                    rows={4} // You can adjust the number of rows as needed
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            {/* Photo Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Photo
                </label>
                <div className="mt-2 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative">
                        <Image
                            src={photoPreview || '/assets/logo/avatar-default.png'}
                            alt="Profile preview"
                            width={80}
                            height={80}
                            className="w-20 h-20 rounded-full object-cover border border-gray-200"
                        />
                        {photoPreview && (
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="absolute -top-2 -right-2 text-red-500 hover:text-red-700 bg-white rounded-full"
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <label
                            htmlFor="photo"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md cursor-pointer inline-block text-sm text-gray-700"
                        >
                            Choose Photo
                        </label>
                        <span className="text-xs text-gray-500">
                            JPEG, PNG, GIF or WebP (MAX. 5MB)
                        </span>
                    </div>
                    <input
                        ref={fileInputRef}
                        id="photo"
                        name="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
                {errors.photo && (
                    <p className="mt-2 text-sm text-red-500">{errors.photo}</p>
                )}
            </div>

            <div className="flex">
                <button
                    type="submit"
                    className="px-4 py-2 text-white bg-blue-800 hover:bg-blue-900 rounded-lg ms-auto"
                >
                    {isSubmitting ? 'Creating...' : isEditing ? 'Update Customer' : 'Create Customer'}
                </button>
            </div>
        </form>
    );
}