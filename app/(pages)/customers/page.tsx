'use client'

import * as React from 'react';
import CustomerCardList from '@/components/CustomerCardList';
import { Customer } from '@/types/database.types';
import { GlobeAmericasIcon, GlobeAsiaAustraliaIcon, MagnifyingGlassCircleIcon, MagnifyingGlassIcon, PlusIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CustomerPage() {
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "wni" | "wna">("all");
  const [sortBy, setSortBy] = useState<"full_name" | "email" | "created_at" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [stats, setStats] = useState({
    total: 0,
    wni: 0,
    wna: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  async function fetchStats() {
    try {
      const response = await fetch('/api/customers/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCustomerDelete = () => {
    fetchStats();
  }

  return (
    <div>
      <div className='mb-5'>
        <h1 className='text-3xl font-bold text-gray-800 dark:text-white'>Customers</h1>
        <p className='text-base font-medium text-gray-500 dark:text-white'>Manage all customers</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        <div className='p-6 flex flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg'>
          <div>
            <div className='text-base text-blue-700 dark:text-white font-bold mb-3'><span>Total Customers</span></div>
            <div className='text-5xl text-blue-700 dark:text-white font-bold'>{isLoading ? '...' : stats.total}</div>
          </div>
          <div className='text-blue-700 dark:text-white '>
            <PresentationChartBarIcon strokeWidth={1} width={64} height={64} />
          </div>
        </div>
        <div className='p-6 flex flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg'>
          <div>
            <div className='text-base text-blue-700 dark:text-white font-bold mb-3'><span>Total WNI</span></div>
            <div className='text-5xl text-blue-700 dark:text-white font-bold'>{isLoading ? '...' : stats.wni}</div>
          </div>
          <div className='text-blue-700 dark:text-white '>
            <GlobeAsiaAustraliaIcon strokeWidth={1} width={64} height={64} />
          </div>
        </div>
        <div className='p-6 flex flex-row items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg'>
          <div>
            <div className='text-base text-blue-700 dark:text-white font-bold mb-3'><span>Total WNA</span></div>
            <div className='text-5xl text-blue-700 dark:text-white font-bold'>{isLoading ? '...' : stats.wna}</div>
          </div>
          <div className='text-blue-700 dark:text-white '>
            <GlobeAmericasIcon strokeWidth={1} width={64} height={64} />
          </div>
        </div>
      </div>

      <div className='p-4 rounded-lg bg-white dark:bg-gray-800'>
        <div className='flex flex-col lg:flex-row justify-between mb-5'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-5 lg:mb-0'>All Customers <span>({isLoading ? '...' : stats.total})</span></h3>
          <Link href={'customers/create'} className='px-4 py-2 flex gap-2 items-center bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 text-white rounded-md'>
            <PlusIcon width={14} height={14} />
            <span>Add Customer</span>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "wni" | "wna")}
            className="w-full lg:w-1/5 px-4 py-2 text-gray-600 dark:text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="wni">WNI</option>
            <option value="wna">WNA</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "full_name" | "email" | "created_at" | "")}
            className="w-full md:w-1/5 px-4 py-2 text-gray-600 dark:text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sort By</option>
            <option value="full_name">Name</option>
            <option value="email">Email</option>
            <option value="created_at">Date</option>
          </select>
          {sortBy &&
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-1/5 px-4 py-2 text-gray-600 dark:text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          }

          <div className='w-full lg:w-1/5 flex relative items-center lg:ms-auto'>
            <MagnifyingGlassIcon width={24} height={24} className='text-gray-400 absolute left-2' />
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-gray-600 dark:text-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <CustomerCardList
          filter={filter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          search={search}
          onCustomerDelete={handleCustomerDelete} />
      </div>

    </div>
  );
}
