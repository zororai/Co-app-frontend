'use client';
import React, { useState, useEffect } from 'react';


import type { User } from '@/types/user';
import { Customer } from '@/components/dashboard/customer/customers-table';

function generateToken(): string {
  const arr = new Uint8Array(12);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: 'USR-000',
  avatar: '/assets/avatar.png',
  firstName: 'Sofia',
  lastName: 'Rivers',
  email: 'sofia@devias.io',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
    /**
     * Fetch only approved sections from the backend
     */
    async fetchSectionsApproved(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/sections/status/approved', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch approved sections');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.sections || [];
        } catch (error) {
            console.error('Error fetching approved sections:', error);
            return [];
        }
    }
    /**
     * Fetch all sections from the backend
     */
    async fetchSections(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/sections', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch sections');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.sections || [];
        } catch (error) {
            console.error('Error fetching sections:', error);
            return [];
        }
    }
    async fetchAllMiners(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/miners', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch miners');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.miners || [];
        } catch (error) {
            console.error('Error fetching miners:', error);
            return [];
        }
    }
    /**
     * Fetch a company by its ID
     */
    async fetchCompanyById(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/companies/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch company details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching company details:', error);
            return null;
        }
    }
    
    /**
     * Set a miner for approval
     * @param id The ID of the miner to approve
     * @returns A promise that resolves to the response data or null on error
     */
    async setMinerForApproval(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/miners/${id}/set_for_approval`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to approve miner: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error approving miner:', error);
            return null;
        }
    }

    async setCompanyMinerForApproval(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/companies/${id}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to approve miner: ${response.statusText}`);
            }
            const text = await response.text();
            try {
                return JSON.parse(text);
            } catch {
                return text; // Return plain text if not JSON
            }
        } catch (error) {
            console.error('Error approving miner:', error);
            return null;
        }
    }

    /**
     * Set a miner for rejection
     * @param id The ID of the miner to reject
     * @param reason The reason for rejection
     * @returns A promise that resolves to the response data or null on error
     */
    async setMinerForRejection(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`http://localhost:1000/api/miners/${id}/reject?reason=${encodeURIComponent(reason)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to reject miner: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error rejecting miner:', error);
            return null;
        }
    }
    async setCompanyMinerForRejection(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`http://localhost:1000/api/companies/${id}/reject?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to reject miner: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error rejecting miner:', error);
            return null;
        }
    }

    /**
     * Set a miner for push back
     * @param id The ID of the miner to push back
     * @param reason The reason for pushing back
     * @returns A promise that resolves to the response data or null on error
     */
    async setMinerForPushBack(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`http://localhost:1000/api/miners/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to push back miner: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error pushing back miner:', error);
            return null;
        }
    }

    async setCompanyMinerForPushBack(id: string, reason: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            // Using the new API endpoint format with reason as a query parameter
            const response = await fetch(`http://localhost:1000/api/companies/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error(`Failed to push back miner: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error pushing back miner:', error);
            return null;
        }
    }
    /**
     * Fetch companies from the endpoint http://localhost:1000/api/companies
     * Returns an array of companies or an empty array on error.
     */
    async fetchCompaniesFromEndpoint(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/companies', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            const text = await response.text();
            if (!text) {
                return [];
            }
            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : (data.companies || []);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', text);
                return [];
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }

    async fetchCompaniesApproved(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/companies/status/approved', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            const text = await response.text();
            if (!text) {
                return [];
            }
            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : (data.companies || []);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', text);
                return [];
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }
    async registerCompany(formData: any): Promise<{ error?: string; success?: boolean }> {
        try {
            const token = localStorage.getItem('custom-auth-token');
            if (!token) {
                throw new Error('Authentication required');
            }

            // Check if documents are directly in formData or in a nested documents object
            const documents = formData.documents || formData;
            
            const requestData = {
                companyName: formData.companyName,
                address: formData.address,
                cellNumber: formData.contactNumber,
                email: formData.email,
                companyLogo: documents.companyLogo,
                certificateOfCooperation: documents.certificateOfCooperation,
                cr14Copy: documents.cr14Document,
                miningCertificate: documents.miningCertificate,
                taxClearance: documents.taxClearance,
                passportPhoto: documents.passportPhotos, // Handle as a single string, not an array
                ownerName: formData.ownerName,
                ownerSurname: formData.ownerSurname,
                ownerAddress: formData.ownerAddress,
                ownerCellNumber: formData.ownerCellNumber,
                ownerIdNumber: formData.ownerIdNumber
            };

            console.log('Sending company registration data:', requestData);

            const response = await fetch('http://localhost:1000/api/companies/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json' // Added Content-Type header
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            let data;
            const responseText = await response.text();
            
            try {
                // Try to parse as JSON
                data = JSON.parse(responseText);
            } catch (parseError) {
                // If it's not valid JSON, use the raw text
                data = responseText;
            }

            if (!response.ok) {
                console.error('Company registration failed:', data);
                return { 
                    error: typeof data === 'object' && data !== null ? (data.message || data.error) : responseText || 'Company registration failed',
                    success: false 
                };
            }

            return { 
                success: true 
            };
        } catch (error: any) {
            console.error('Error during company registration:', error);
            return { 
                error: 'Failed to register company. Please try again.',
                success: false 
            };
        }
    }
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

 async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string; token?: string }> {
  const { email, password } = params;

  try {
    const response = await fetch('http://localhost:1000/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();
    console.log('Login response:', data); // Debug: show full response

    if (!response.ok) {
      // Special handling for 401 Unauthorized
      if (response.status === 401) {
        return { error: 'Invalid email or password' };
      }
      // For other errors, use the API response message
      return { error: data.message || data.error || 'Authentication failed' };
    }

    // Assuming the API returns a token in the response
    const token = data.token || generateToken();
    
    localStorage.setItem('custom-auth-token', token);

    return { token };
  } catch (error) {
    // Try to parse the error message if it's from the API
   
    // If it's a network error or other issue
    return { error: 'Invalid email or password' };
  }
}
    async fetchCompanies(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/companies/getall', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }

            const text = await response.text();
            if (!text) {
                return [];
            }

            try {
                const data = JSON.parse(text);
                return Array.isArray(data) ? data : (data.companies || []);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                console.log('Raw response:', text);
                return [];
            }
        } catch (error) {
            console.error('Error fetching companies:', error);
            return [];
        }
    }
    async fetchCompanyDetails(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/companies/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customer details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer details:', error);
            return null;
        }
    }
 
    async fetchCustomerDetails(id: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/miners/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customer details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching customer details:', error);
            return null;
        }
    }

    async fetchCustomers(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin'; // Redirect to sign-in page
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/miners/getall', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
     async fetchSection(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin'; // Redirect to sign-in page
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/sections', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
    
  

    async fetchSectionstatus(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin'; // Redirect to sign-in page
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/sections', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
     async fetchApprovedminer(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin'; // Redirect to sign-in page
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/miners/getapproved', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }
    
    async fetchPendingCustomers(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin'; // Redirect to sign-in page
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/miners/getall', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const text = await response.text();
      
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                return [];
            }
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

       async fetchAllCompany(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin'; // Redirect to sign-in page
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/companies', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const text = await response.text();
      
            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON:', parseError);
                return [];
            }
            return Array.isArray(data) ? data : data.customers || [];
        } catch (error) {
            console.error('Error fetching customers:', error);
            return [];
        }
    }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request

    // We do not handle the API, so just check if we have a token in localStorage.
    const token = localStorage.getItem('custom-auth-token');

    if (!token) {
      return { data: null };
    }

    return { data: user };
  }

  async signOut(): Promise<{ error?: string }> {
    localStorage.removeItem('custom-auth-token');
    return {};
  }

  async registerMiner(data: {
    name: string;
    surname: string;
    address: string;
    cell: string;
    nationId: string;
    position: string;
cooperativename: string;
    idPicture: string;  // Changed to string for base64
    teamMembers: Array<{
      name: string;
      surname: string;
      address: string;
      idNumber: string;
   
    }>;
  }): Promise<{ error?: string; success?: boolean }> {
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Send JSON data with base64 image
      const response = await fetch('http://localhost:1000/api/miners/createminers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          address: data.address,
          cellNumber: data.cell,
          nationIdNumber: data.nationId,
          position: data.position,
          cooperativename: data.cooperativename,
          idPicture: data.idPicture,  // Send base64 image string
          teamMembers: data.teamMembers
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register miner');
      }

      const result = await response.json();
      return { success: true };
    } catch (error) {
      console.error('Error registering miner:', error);
      return { error: error instanceof Error ? error.message : 'Failed to register miner' };
    }
  }

  /**
   * Create shaft assignment
   * @param shaftAssignmentData The shaft assignment data
   * @returns A promise that resolves to the response data or null on error
   */
  async createShaftAssignment(shaftAssignmentData: {
    sectionName: string;
    shaftNumbers: string;
    medicalFee: string;
    reason: string;
    status: string;
    regFee: string;
    startContractDate: string;
    endContractDate: string;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    const response = await fetch('http://localhost:1000/api/shaft-assignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      body: JSON.stringify(shaftAssignmentData),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Failed with status ${response.status}`);
    }
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  

  /**
   * Create a new section
   * @param sectionData The section data
   * @returns A promise that resolves to the response data or throws an error
   */
  async createSection(sectionData: {
    sectionName: string;
    numberOfShaft: string;
    status: string;
    reason: string;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch('http://localhost:1000/api/sections/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(sectionData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to create section: ${response.status} ${response.statusText} - ${errorText}`);
      }
      return await response.text();
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  }

  /**
   * Approve a section
   * @param id The ID of the section to approve
   * @returns A promise that resolves to the response data or null on error
   */
  async setSectionForApproval(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/sections/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to approve section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error approving section:', error);
      return null;
    }
  }

  /**
   * Reject a section
   * @param id The ID of the section to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to the response data or null on error
   */
  async setSectionForRejection(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/sections/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to reject section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error rejecting section:', error);
      return null;
    }
  }

  /**
   * Push back a section
   * @param id The ID of the section to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to the response data or null on error
   */
  async setSectionForPushBack(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/sections/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to push back section: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error pushing back section:', error);
      return null;
    }
  }
}

export const authClient = new AuthClient();

// Usage example after login:
// const { token } = await authClient.signInWithPassword({ email, password });
// const customers = await authClient.fetchCustomers(token);
