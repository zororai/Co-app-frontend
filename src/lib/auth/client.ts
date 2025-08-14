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
     * Create a new user
     */
    async createUser(userData: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        idNumber: string;
        address: string;
        role: string;
        location: string;
        position: string;
        isActive: boolean;
        notes: string;
        startDate?: string;
        emergencyContactName?: string;
        emergencyContactPhone?: string;
    }): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return { success: false, error: 'Authentication required' };
        }

        try {
            // Map frontend fields to backend expected fields
            const requestData = {
                name: userData.firstName,
                surname: userData.lastName,
                password: Math.random().toString(36).slice(-10), // Generate random password
                idNumber: userData.idNumber,
                address: userData.address,
                cellNumber: userData.phone,
                email: userData.email,
                position: userData.position,
                role: userData.role,
                status: userData.isActive ? 'active' : 'inactive',
                notes: userData.notes,
                reason: '' // This field is empty as it wasn't specified in the frontend
            };

            const response = await fetch('http://localhost:1000/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create user');
            }

            const data = await response.json();
            return { success: true, data, password: requestData.password };
        } catch (error) {
            console.error('Error creating user:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

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
    /**
     * Fetch all users from the backend
     */
   
    /**
     * Create a new ore transport record
     * @param oreData The ore transport data to create
     * @returns A promise that resolves to the response data or error
     */
    async createOre(oreData: {
        shaftNumbers: string;
        weight: string | number;
        numberOfBags: string | number;
        transportStatus: string;
        selectedTransportdriver: string;
        selectedTransport: string;
        originLocation?: string;
        destination?: string;
        notes?: string;
        transportReason?: string;
        processStatus?: string;
        location?: string;
        date: string;
        time: {
            hour: number;
            minute: number;
            second: number;
            nano: number;
        };
        tax: Array<{
            taxType: string;
            taxRate: number;
        }>;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return { success: false, error: 'Authentication required' };
        }

        try {
            // Format the data according to the API requirements
            // Format the data to match the backend model structure
            const requestData = {
                shaftNumbers: oreData.shaftNumbers, // Backend expects a string, not an array
                weight: Number(oreData.weight),
                numberOfBags: Number(oreData.numberOfBags),
                transportStatus: oreData.transportStatus,
                tax: oreData.tax,
                processStatus: oreData.processStatus || '',
                location: oreData.location || ''
                // Removed fields not in the backend model:
                // selectedTransportdriver, selectedTransport, transportReason, date, time
            };

            console.log('Sending request to API with data:', JSON.stringify(requestData));
            const response = await fetch('http://localhost:1000/api/ore-transports/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(requestData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create ore transport record');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error creating ore transport record:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    /**
     * Register a new security company
     * @param securityCompanyData The security company data to register
     * @returns A promise that resolves to the response data or error
     */
    async registerSecurityCompany(securityCompanyData: {
        companyName: string;
        registrationNumber: string;
        contactPhone: string;
        contactPersonName: string;
        contactEmail: string;
        siteAddress: string;
        serviceType: string;
        headOfficeAddress: string;
        numberOfWorks: string;
        startContractDate: string;
        endContractDate: string;
        emergencyContactPhone: string;
        emergencyContactName: string;
        locations: string[];
        validTaxClearance: string;
        companyLogo: string;
        getCertificateOfCooperation: string;
        operatingLicense: string;
        proofOfInsurance: string;
        siteRiskAssessmentReport: string;
    }): Promise<{ success: boolean; data?: any; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return { success: false, error: 'Authentication required' };
        }

        try {
            const response = await fetch('http://localhost:1000/api/security-companies/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(securityCompanyData),
                credentials: 'include',
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to register security company');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Error registering security company:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error occurred' 
            };
        }
    }

    // registerDriver method is implemented elsewhere in the file
    
    // fetchDrivers method is implemented elsewhere in the file
    
    /**
     * Fetch driver details by ID
     */
    async fetchDriverById(driverId: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/drivers/${driverId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch driver details');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching driver with ID ${driverId}:`, error);
            return null;
        }
    }

    async  fetchsecurityonboarding(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/security-companies/register', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.users || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    async fetchSecurityCompany(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/security-companies', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.securityCompanies || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }
    
    /**
     * Fetch all ore transport data from the backend
     * @returns A promise that resolves to an array of ore transport records
     */
    async fetchOreTransportData(): Promise<any[]> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/auth/signin';
          return [];
      }
      try {
          const response = await fetch('http://localhost:1000/api/ore-transports/allOre', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              throw new Error('Failed to fetch users');
          }
          const data = await response.json();
          return Array.isArray(data) ? data : data.users || [];
      } catch (error) {
          console.error('Error fetching users:', error);
          return [];
      }
  }
 
    
    async fetchUsers(): Promise<any[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/users', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.users || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }
    
    /**
     * Fetch user details by ID
     */
    async fetchUserById(userId: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching user with ID ${userId}:`, error);
            return null;
        }
    }
    
    /**
     * Approve a user by ID
     */
    async approveUser(userId: string): Promise<{ success: boolean; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return { success: false, error: 'Authentication required' };
        }
        try {
            const response = await fetch(`http://localhost:1000/api/users/${userId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to approve user');
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error approving user with ID ${userId}:`, error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unexpected error occurred' 
            };
        }
    }
    
    /**
     * Reject a user by ID with reason
     */
    async rejectUser(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return { success: false, error: 'Authentication required' };
        }
        try {
            const response = await fetch(`http://localhost:1000/api/users/${userId}/reject?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to reject user');
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error rejecting user with ID ${userId}:`, error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unexpected error occurred' 
            };
        }
    }
    
    /**
     * Push back a user by ID with reason
     */
    async pushbackUser(userId: string, reason: string): Promise<{ success: boolean; error?: string }> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return { success: false, error: 'Authentication required' };
        }
        try {
            const response = await fetch(`http://localhost:1000/api/users/${userId}/pushback?reason=${encodeURIComponent(reason)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to push back user');
            }
            
            return { success: true };
        } catch (error) {
            console.error(`Error pushing back user with ID ${userId}:`, error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'An unexpected error occurred' 
            };
        }
    }

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
            const response = await fetch('http://localhost:1000/api/sections/miners', {
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
   * Fetch all drivers from the backend
   */
  async fetchDrivers(): Promise<any[]> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return [];
    }
    try {
      const response = await fetch('http://localhost:1000/api/drivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch drivers');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : data.drivers || [];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  }

  /**
   * Approve a driver by ID
   * @param driverId The ID of the driver to approve
   * @returns A promise that resolves to the response data or error
   */
  async approveDriver(driverId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    try {
      const response = await fetch(`http://localhost:1000/api/drivers/${driverId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to approve driver');
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error approving driver with ID ${driverId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Reject a driver by ID with reason
   * @param driverId The ID of the driver to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to the response data or error
   */
  async rejectDriver(driverId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) {
      return { success: false, error: 'Reason is required for rejection' };
    }
    
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    try {
      const response = await fetch(`http://localhost:1000/api/drivers/${driverId}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reject driver');
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error rejecting driver with ID ${driverId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  /**
   * Push back a driver by ID with reason
   * @param driverId The ID of the driver to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to the response data or error
   */
  async pushbackDriver(driverId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    if (!reason.trim()) {
      return { success: false, error: 'Reason is required for pushback' };
    }
    
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }
    try {
      const response = await fetch(`http://localhost:1000/api/drivers/${driverId}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to push back driver');
      }
      
      return { success: true };
    } catch (error) {
      console.error(`Error pushing back driver with ID ${driverId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

    /**
     * Fetch shaft assignments by miner ID
     */
    async fetchShaftAssignmentsByMiner(minerId: string): Promise<any> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin';
            return null;
        }
        try {
            const response = await fetch(`http://localhost:1000/api/shaft-assignments/by-miner/${minerId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*',
                    'Authorization': `Bearer ${token}`,
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Failed to fetch shaft assignments');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching shaft assignments:', error);
            return null;
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
    async fetchOreDetails(id: string): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/auth/signin';
          return null;
      }
      try {
          const response = await fetch(`http://localhost:1000/api/ore-transports/${id}`, {
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
  
  /**
   * Fetch approved shaft assignments
   * @returns A promise that resolves to the approved shaft assignments or null on error
   */
  async fetchApprovedShaftAssignments(): Promise<any> {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
          console.error('No token found in localStorage');
          window.location.href = '/auth/signin';
          return null;
      }
      try {
          const response = await fetch('http://localhost:1000/api/shaft-assignments/approved', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              credentials: 'include',
          });
          if (!response.ok) {
              throw new Error('Failed to fetch approved shaft assignments');
          }
          return await response.json();
      } catch (error) {
          console.error('Error fetching approved shaft assignments:', error);
          return null;
      }
  }

  async fetchSecurityDetails(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
        console.error('No token found in localStorage');
        window.location.href = '/auth/signin';
        return null;
    }
    try {
        const response = await fetch(`http://localhost:1000/api/security-companies/${id}`, {
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
    async fetchShaftstatus(): Promise<Customer[]> {
        const token = localStorage.getItem('custom-auth-token');
        if (!token) {
            console.error('No token found in localStorage');
            window.location.href = '/auth/signin'; // Redirect to sign-in page
            return [];
        }
        try {
            const response = await fetch('http://localhost:1000/api/shaft-assignments', {
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
  async setShaftForApproval(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/shaft-assignments/${id}/approve`, {
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

  async approveVehicle(id: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/vehicles/${id}/approve`, {
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

  async setShaftAssignmentForApproval(id: string): Promise<any> {
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
  async setShaftForRejection(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/shaft-assignments/${id}/reject?reason=${encodeURIComponent(reason)}`, {
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
  async setShaftForPushBack(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/shaft-assignments/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
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

  async rejectVehicle(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/vehicles/${id}/reject?reason=${encodeURIComponent(reason)}`, {
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

  async pushBackVehicle(id: string, reason: string): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch(`http://localhost:1000/api/vehicles/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
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

  /**
   * Import miners data to the backend
   * @param data The miners data to import
   * @returns A promise that resolves to the response data or null on error
   */
  async importMinersData(data: any[]): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return null;
    }
    try {
      const response = await fetch('/api/miners/import', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to import data: ${response.statusText}`);
      }
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch {
        return text; // Return plain text if not JSON
      }
    } catch (error) {
      console.error('Error sending imported data:', error);
      return null;
    }
  }

  /**
   * Register a new driver
   * @param driverData The driver data to register
   * @returns A promise that resolves to the response data or null on error
   */
  async registerDriver(driverData: {
    firstName: string;
    lastName: string;
    idNumber: string;
    dateOfBirth: any; // dayjs.Dayjs | null
    licenseNumber: string;
    licenseClass: string;
    licenseExpiryDate: any; // dayjs.Dayjs | null
    yearsOfExperience: string;
    phoneNumber: string;
    emailAddress: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    licenseDocument: string | null; // Changed to string for base64
    idDocument: string | null; // Changed to string for base64
    additionalNotes: string;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Safely format dates if they exist and have format method
      const dateOfBirth = driverData.dateOfBirth && typeof driverData.dateOfBirth.format === 'function' 
        ? driverData.dateOfBirth.format('YYYY-MM-DD') 
        : null;
        
      const licenseExpiryDate = driverData.licenseExpiryDate && typeof driverData.licenseExpiryDate.format === 'function' 
        ? driverData.licenseExpiryDate.format('YYYY-MM-DD') 
        : null;
      
      // Create the request data with all fields including base64 document strings
      const requestData = {
        firstName: driverData.firstName,
        lastName: driverData.lastName,
        idNumber: driverData.idNumber,
        dateOfBirth: dateOfBirth,
        licenseNumber: driverData.licenseNumber,
        licenseClass: driverData.licenseClass,
        licenseExpiryDate: licenseExpiryDate,
        yearsOfExperience: parseInt(driverData.yearsOfExperience) || 0,
        phoneNumber: driverData.phoneNumber,
        emailAddress: driverData.emailAddress,
        address: driverData.address,
        emergencyContactName: driverData.emergencyContactName,
        emergencyContactPhone: driverData.emergencyContactPhone,
        licenseDocument: driverData.licenseDocument, // Now a base64 string
        idDocument: driverData.idDocument, // Now a base64 string
        additionalNotes: driverData.additionalNotes
      };

      const response = await fetch('http://localhost:1000/api/drivers/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `Failed to register driver: ${response.statusText}`;
        } catch {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Failed to register driver: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Clone the response before reading its body
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error registering driver:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Register a new vehicle
   * @param vehicleData The vehicle data to register
   * @returns A promise that resolves to the response data or error
   */
  async registerVehicle(vehicleData: {
    regNumber: string;
    vehicleType: string;
    make: string;
    model: string;
    year: string;
    assignedDriver: string;
    lastServiceDate: any; // dayjs.Dayjs | null
    ownerName: string;
    ownerAddress: string;
    ownerCellNumber: string;
    ownerIdNumber: string;
    idPicture: File | null;
    truckPicture: File | null;
    registrationBook: File | null;
  }): Promise<any> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Convert file objects to base64 strings
      const idPictureBase64 = vehicleData.idPicture ? await this.fileToBase64(vehicleData.idPicture) : null;
      const truckPictureBase64 = vehicleData.truckPicture ? await this.fileToBase64(vehicleData.truckPicture) : null;
      const registrationBookBase64 = vehicleData.registrationBook ? await this.fileToBase64(vehicleData.registrationBook) : null;
      
      // Safely format date if it exists and has format method
      const lastServiceDate = vehicleData.lastServiceDate && typeof vehicleData.lastServiceDate.format === 'function' 
        ? vehicleData.lastServiceDate.format('YYYY-MM-DD') 
        : null;
      
      // Map frontend fields to backend expected fields
      const requestData = {
        regNumber: vehicleData.regNumber,
        vehicleType: vehicleData.vehicleType,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        assignedDriver: vehicleData.assignedDriver,
        lastServiceDate: lastServiceDate,
        ownerName: vehicleData.ownerName,
        ownerAddress: vehicleData.ownerAddress,
        ownerCellNumber: vehicleData.ownerCellNumber,
        ownerIdNumber: vehicleData.ownerIdNumber,
        idPicture: idPictureBase64,
        truckPicture: truckPictureBase64,
        registrationBook: registrationBookBase64,
      };

      const response = await fetch('http://localhost:1000/api/vehicles/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `Failed to register vehicle: ${response.statusText}`;
        } catch {
          // If not valid JSON, use the text directly
          errorMessage = errorText || `Failed to register vehicle: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Clone the response before reading its body
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Error registering vehicle:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
  
  /**
   * Convert a File object to a base64 string
   * @param file The file to convert
   * @returns A promise that resolves to the base64 string
   */
  fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., 'data:image/jpeg;base64,') to get just the base64 string
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Get the authentication token from localStorage
   * @returns The authentication token or null if not found
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('custom-auth-token');
    }
    return null;
  }

  /**
   * Fetch all vehicles from the API
   * @returns A promise that resolves to the vehicles data
   */
  async fetchVehicles() {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('http://localhost:1000/api/vehicles', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching vehicles: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  async fetchApprovedVehicles() {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('http://localhost:1000/api/vehicles/status/approved', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching vehicles: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }
  /**
   * Fetch approved drivers from the API
   * @returns A promise that resolves to the approved drivers data
   */
  async fetchApprovedDrivers() {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('http://localhost:1000/api/drivers/status/approved', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching approved drivers: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching approved drivers:', error);
      throw error;
    }
  }
  
  /**
   * Fetch ore transport data
   * @returns A promise that resolves to the ore data
   */
  async fetchOre() {
    try {
      const token = this.getToken();
      if (!token) {
        console.warn('No authentication token found');
      }

      const response = await fetch('http://localhost:1000/api/ore-transports/allOre', {
        method: 'GET',
        headers: {
          'accept': '*/*',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (!response.ok) {
        throw new Error(`Error fetching approved drivers: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching approved drivers:', error);
      throw error;
    }
  }


    // This method is implemented above - removing duplicate implementation



  /**
   * Fetch vehicle details by ID
   * @param vehicleId The ID of the vehicle to fetch
   * @returns A promise that resolves to the vehicle details
   */
  async fetchVehicleById(vehicleId: string) {
    try {
      // Get token from localStorage directly to ensure we have the latest token
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        console.warn('No authentication token found in localStorage');
        throw new Error('Authentication token not found');
      }

      console.log('Using token for vehicle fetch:', token.substring(0, 10) + '...');

      const response = await fetch(`http://localhost:1000/api/vehicles/${vehicleId}`, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      console.log('Vehicle fetch response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Error fetching vehicle details: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching vehicle with ID ${vehicleId}:`, error);
      return null;
    }
  }

  /**
   * Approve a security company by ID
   * @param id The ID of the security company to approve
   * @returns A promise that resolves to the response data or error
   */
  async approveSecurityCompany(id: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`http://localhost:1000/api/security-companies/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to approve security company: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error approving security company:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Reject a security company by ID with reason
   * @param id The ID of the security company to reject
   * @param reason The reason for rejection
   * @returns A promise that resolves to the response data or error
   */
  async rejectSecurityCompany(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`http://localhost:1000/api/security-companies/${id}/reject?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to reject security company: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error rejecting security company:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Push back a security company by ID with reason
   * @param id The ID of the security company to push back
   * @param reason The reason for pushing back
   * @returns A promise that resolves to the response data or error
   */
  async pushBackSecurityCompany(id: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return Promise.resolve({ success: false, error: 'Authentication required' });
    }

    try {
      return fetch(`http://localhost:1000/api/security-companies/${id}/pushback?reason=${encodeURIComponent(reason)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      })
      .then(response => {
        if (!response.ok) {
          return response.json().catch(() => ({}))
            .then(errorData => {
              throw new Error(errorData.message || `Failed to push back security company: ${response.status}`);
            });
        }
        return { success: true };
      });
    } catch (error) {
      console.error('Error pushing back security company:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Send a vehicle to maintenance
   * @param vehicleId The ID of the vehicle to send to maintenance
   * @returns A promise that resolves to the response data or error
   */
  async sendVehicleToMaintenance(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`http://localhost:1000/api/vehicles/${vehicleId}/maintainance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to send vehicle to maintenance: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending vehicle to maintenance:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Set a vehicle to idle status (functional)
   * @param vehicleId The ID of the vehicle to set as idle
   * @returns A promise that resolves to the response data or error
   */
  async setVehicleToIdle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      const response = await fetch(`http://localhost:1000/api/vehicles/${vehicleId}/idle`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to set vehicle to idle: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting vehicle to idle:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Fetch vehicles with approved status
   * @returns A promise that resolves to the approved vehicles data
   */
  async fetchVehiclesByApprovedStatus(): Promise<any[]> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return [];
    }

    try {
      const response = await fetch('http://localhost:1000/api/vehicles/status/approved', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch approved vehicles');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching approved vehicles by status:', error);
      return [];
    }
  }

  /**
   * Update ore transport fields
   * @param oreId The ID of the ore transport to update
   * @param fields The fields to update (selectedTransportdriver, transportStatus, selectedTransport, transportReason)
   * @returns A promise that resolves to the response data or error
   */
  async updateOreTransportFields(oreId: string, fields: {
    selectedTransportdriver: string;
    transportStatus: string;
    selectedTransport: string;
    transportReason: string;
  }): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      console.error('No token found in localStorage');
      window.location.href = '/auth/signin';
      return { success: false, error: 'Authentication required' };
    }

    try {
      // Construct the query string from the fields object
      const queryParams = new URLSearchParams();
      Object.entries(fields).forEach(([key, value]) => {
        queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:1000/api/ore-transports/${oreId}/fields?${queryParams.toString()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update ore transport fields: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating ore transport fields:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}








export const authClient = new AuthClient();

// Usage example after login:
// const { token } = await authClient.signInWithPassword({ email, password });
// const customers = await authClient.fetchCustomers(token);
