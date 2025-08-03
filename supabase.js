// Enhanced Supabase client implementation to avoid CDN dependency
class SupabaseClient {
  constructor(url, key, options = {}) {
    this.url = url;
    this.key = key;
    this.options = options;
    this.session = null;
    
    // Bind the context for auth methods
    const self = this;
    
    this.auth = {
      signIn: async ({ email, password }) => {
        try {
          // Authenticate against Supabase Auth API
          const response = await fetch(`${self.url}/auth/v1/token?grant_type=password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': self.key
            },
            body: JSON.stringify({ email, password })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || 'Authentication failed');
          }
          
          const data = await response.json();
          self.session = data;
          
          // Store the session in localStorage for persistence
          localStorage.setItem('supabase.auth.token', JSON.stringify(data));
          
          // Check if user is an admin by querying the profiles table
          const userResponse = await self._executeQuery(
            'profiles',
            'id, is_admin, display_name',
            { user_id: data.user.id }
          );
          
          if (userResponse.data && userResponse.data.length > 0) {
            const isAdmin = userResponse.data[0].is_admin;
            data.user.is_admin = isAdmin;
            
            // Update session with admin status
            self.session = data;
            localStorage.setItem('supabase.auth.token', JSON.stringify(data));
            
            if (!isAdmin) {
              // If not an admin, sign out
              await self.auth.signOut();
              return { data: null, error: { message: 'Unauthorized: Admin access required' } };
            }
          }
          
          return { data, error: null };
        } catch (error) {
          console.error('Auth error:', error);
          return { data: null, error };
        }
      },
      signOut: async () => {
        try {
          // Clear local session data
          self.session = null;
          localStorage.removeItem('supabase.auth.token');
          
          // Call Supabase signout endpoint
          await fetch(`${self.url}/auth/v1/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': self.key
            }
          });
          
          return { error: null };
        } catch (error) {
          return { error };
        }
      },
      getSession: () => {
        // Try to get from memory first, then from localStorage
        let session = null;
        
        if (self.session) {
          session = self.session;
        } else {
          const savedSession = localStorage.getItem('supabase.auth.token');
          if (savedSession) {
            try {
              session = JSON.parse(savedSession);
              self.session = session;
            } catch (e) {
              console.error('Error parsing saved session:', e);
            }
          }
        }
        
        // Return in the expected Supabase format
        return Promise.resolve({ 
          data: { session }, 
          error: null 
        });
      }
    };
    
    // Storage functionality for file uploads
    this.storage = {
      from: (bucketName) => {
        return {
          upload: async (fileName, file, options = {}) => {
            try {
              const formData = new FormData();
              formData.append('file', file);
              
              const response = await fetch(`${self.url}/storage/v1/object/${bucketName}/${fileName}`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${self.key}`
                },
                body: formData
              });
              
              if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Upload failed: ${response.status} ${errorData}`);
              }
              
              const data = await response.json();
              return { data, error: null };
            } catch (error) {
              console.error('Storage upload error:', error);
              return { data: null, error };
            }
          },
          
          getPublicUrl: (fileName) => {
            return {
              data: {
                publicUrl: `${self.url}/storage/v1/object/public/${bucketName}/${fileName}`
              }
            };
          }
        };
      }
    };
  }

  // Enhanced implementation of the from method for database operations
  from(table) {
    const self = this;
    return {
      select: (columns = '*') => {
        const query = {
          table,
          columns,
          filters: [],
          orderBy: null,
          limit: null,
          range: null
        };
        
        return self._buildQueryObject(query);
      },
      
      insert: (data) => {
        return self._executeInsert(table, data);
      },
      
      update: (data) => {
        return {
          match: (filters) => self._executeUpdate(table, data, filters),
          eq: (column, value) => self._executeUpdate(table, data, { [column]: value })
        };
      },
      
      delete: function() {
        return {
          match: (filters) => self._executeDelete(table, filters),
          eq: (column, value) => self._executeDelete(table, { [column]: value })
        };
      }
    };
  }

  // Helper methods for simulating database operations
  async _executeQuery(table, columns, filter) {
    try {
      const filterParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filter)) {
        filterParams.append(key, `eq.${value}`);
      }
      
      const response = await fetch(`${this.url}/rest/v1/${table}?select=${columns}&${filterParams.toString()}`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`
        }
      });
      
      if (!response.ok) throw new Error('Database query failed');
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Query error:', error);
      return { data: null, error };
    }
  }
  
  async _executeInsert(table, data) {
    try {
      const response = await fetch(`${this.url}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Database insert failed');
      
      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      console.error('Insert error:', error);
      return { data: null, error };
    }
  }
  
  async _executeUpdate(table, data, filter) {
    try {
      const filterParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filter)) {
        filterParams.append(key, `eq.${value}`);
      }
      
      const response = await fetch(`${this.url}/rest/v1/${table}?${filterParams.toString()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Database update failed');
      
      const result = await response.json();
      return { data: result, error: null };
    } catch (error) {
      console.error('Update error:', error);
      return { data: null, error };
    }
  }
  
  async _executeDelete(table, filter) {
    try {
      const filterParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filter)) {
        filterParams.append(key, `eq.${value}`);
      }
      
      const response = await fetch(`${this.url}/rest/v1/${table}?${filterParams.toString()}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`
        }
      });
      
      if (!response.ok) throw new Error('Database delete failed');
      
      return { error: null };
    } catch (error) {
      console.error('Delete error:', error);
      return { error };
    }
  }

  // Build query object for chained operations
  _buildQueryObject(query) {
    const self = this;
    return {
      eq: (column, value) => {
        query.filters.push({ column, operator: 'eq', value });
        return self._buildQueryObject(query);
      },
      neq: (column, value) => {
        query.filters.push({ column, operator: 'neq', value });
        return self._buildQueryObject(query);
      },
      gt: (column, value) => {
        query.filters.push({ column, operator: 'gt', value });
        return self._buildQueryObject(query);
      },
      lt: (column, value) => {
        query.filters.push({ column, operator: 'lt', value });
        return self._buildQueryObject(query);
      },
      gte: (column, value) => {
        query.filters.push({ column, operator: 'gte', value });
        return self._buildQueryObject(query);
      },
      lte: (column, value) => {
        query.filters.push({ column, operator: 'lte', value });
        return self._buildQueryObject(query);
      },
      is: (column, value) => {
        query.filters.push({ column, operator: 'is', value });
        return self._buildQueryObject(query);
      },
      in: (column, values) => {
        query.filters.push({ column, operator: 'in', value: values });
        return self._buildQueryObject(query);
      },
      contains: (column, value) => {
        query.filters.push({ column, operator: 'contains', value });
        return self._buildQueryObject(query);
      },
      textSearch: (column, searchQuery) => {
        query.filters.push({ column, operator: 'textSearch', value: searchQuery });
        return self._buildQueryObject(query);
      },
      order: (column, { ascending = true } = {}) => {
        query.orderBy = { column, ascending };
        return self._buildQueryObject(query);
      },
      limit: (count) => {
        query.limit = count;
        return self._buildQueryObject(query);
      },
      range: (from, to) => {
        query.range = { from, to };
        return self._buildQueryObject(query);
      },
      single: () => {
        query.limit = 1;
        const result = self._executeQueryFromObject(query);
        return {
          ...result,
          then: (callback) => result.then(res => {
            if (res.data && res.data.length) {
              return callback({ data: res.data[0], error: null });
            }
            return callback({ data: null, error: res.error || null });
          })
        };
      },
      // Execute the query
      then: (callback) => {
        return self._executeQueryFromObject(query).then(callback);
      }
    };
  }

  // Execute query from query object
  async _executeQueryFromObject(query) {
    try {
      const filterParams = new URLSearchParams();
      
      // Add filters
      query.filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq':
            filterParams.append(filter.column, `eq.${filter.value}`);
            break;
          case 'neq':
            filterParams.append(filter.column, `neq.${filter.value}`);
            break;
          case 'gt':
            filterParams.append(filter.column, `gt.${filter.value}`);
            break;
          case 'lt':
            filterParams.append(filter.column, `lt.${filter.value}`);
            break;
          case 'gte':
            filterParams.append(filter.column, `gte.${filter.value}`);
            break;
          case 'lte':
            filterParams.append(filter.column, `lte.${filter.value}`);
            break;
          case 'is':
            filterParams.append(filter.column, `is.${filter.value}`);
            break;
          case 'in':
            filterParams.append(filter.column, `in.(${filter.value.join(',')})`);
            break;
          case 'contains':
            filterParams.append(filter.column, `cs.${JSON.stringify(filter.value)}`);
            break;
          case 'textSearch':
            filterParams.append(filter.column, `fts.${filter.value}`);
            break;
        }
      });
      
      // Add ordering
      if (query.orderBy) {
        filterParams.append('order', `${query.orderBy.column}.${query.orderBy.ascending ? 'asc' : 'desc'}`);
      }
      
      // Add limit
      if (query.limit) {
        filterParams.append('limit', query.limit.toString());
      }
      
      // Add range
      if (query.range) {
        const headers = {};
        headers['Range'] = `${query.range.from}-${query.range.to}`;
      }
      
      const response = await fetch(`${this.url}/rest/v1/${query.table}?select=${query.columns}&${filterParams.toString()}`, {
        headers: {
          'apikey': this.key,
          'Authorization': `Bearer ${this.key}`,
          ...(query.range ? { 'Range': `${query.range.from}-${query.range.to}` } : {})
        }
      });
      
      if (!response.ok) throw new Error('Database query failed');
      
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Query execution error:', error);
      return { data: null, error };
    }
  }
}

// Expose the createClient function to match Supabase's API
const createClient = (url, key, options) => {
  return new SupabaseClient(url, key, options);
};

// Export
window.supabaseLocal = {
  createClient
};
