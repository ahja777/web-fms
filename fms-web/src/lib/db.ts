import mysql, { Pool, PoolOptions, RowDataPacket, ResultSetHeader } from 'mysql2/promise';

const poolOptions: PoolOptions = {
  host: '211.236.174.220',
  port: 53306,
  user: 'user',
  password: 'P@ssw0rd',
  database: 'logstic',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(poolOptions);

// 쿼리 로깅 래퍼 함수
export async function queryWithLog<T extends RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params?: unknown[]
): Promise<[T, mysql.FieldPacket[]]> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  // 쿼리 시작 로그
  console.log('\n┌─────────────────────────────────────────────────────────────');
  console.log(`│ [${timestamp}] SQL Query`);
  console.log('├─────────────────────────────────────────────────────────────');
  console.log(`│ ${sql.replace(/\s+/g, ' ').trim()}`);
  if (params && params.length > 0) {
    console.log(`│ Params: ${JSON.stringify(params)}`);
  }

  try {
    const result = await pool.query<T>(sql, params);
    const duration = Date.now() - startTime;

    // 쿼리 완료 로그
    console.log('├─────────────────────────────────────────────────────────────');
    if (Array.isArray(result[0])) {
      console.log(`│ Result: ${result[0].length} rows returned`);
    } else {
      const header = result[0] as ResultSetHeader;
      console.log(`│ Result: ${header.affectedRows} rows affected, insertId: ${header.insertId}`);
    }
    console.log(`│ Duration: ${duration}ms`);
    console.log('└─────────────────────────────────────────────────────────────\n');

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.log('├─────────────────────────────────────────────────────────────');
    console.log(`│ ERROR: ${error}`);
    console.log(`│ Duration: ${duration}ms`);
    console.log('└─────────────────────────────────────────────────────────────\n');
    throw error;
  }
}

export default pool;
