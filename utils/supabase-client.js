const SUPABASE_URL = 'https://cskgepaodgjehckcomig.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNza2dlcGFvZGdqZWhja2NvbWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1Nzk3MjAsImV4cCI6MjA3NzE1NTcyMH0._344O4QgqRH_PYZ_F0eXUTesBPCt7S8DYlAhsAP8JS0';

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
  }

  async query(table, options = {}) {
    let url = `${this.url}/rest/v1/${table}`;
    const params = new URLSearchParams();

    if (options.select) {
      params.append('select', options.select);
    }
    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        params.append(key, `eq.${value}`);
      });
    }
    if (options.order) {
      params.append('order', options.order);
    }
    if (options.limit) {
      params.append('limit', options.limit);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async insert(table, data) {
    const url = `${this.url}/rest/v1/${table}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Insert failed: ${error}`);
    }

    return await response.json();
  }

  async update(table, data, match) {
    let url = `${this.url}/rest/v1/${table}`;
    const params = new URLSearchParams();

    Object.entries(match).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Update failed: ${response.statusText}`);
    }

    return await response.json();
  }

  async delete(table, match) {
    let url = `${this.url}/rest/v1/${table}`;
    const params = new URLSearchParams();

    Object.entries(match).forEach(([key, value]) => {
      params.append(key, `eq.${value}`);
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return true;
  }
}

const supabase = new SupabaseClient();
