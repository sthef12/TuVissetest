import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:RxvlOmTsEZFOeIcYsJiPhBUpZrRrkGPE@caboose.proxy.rlwy.net:18052/railway',
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
