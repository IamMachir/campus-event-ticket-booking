jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const { splitSqlStatements } = require('../src/config/runMigrations');

describe('splitSqlStatements', () => {
  it('does not split semicolons inside comments or quoted values', () => {
    const statements = splitSqlStatements(`
      -- A comment can contain a semicolon; without ending the statement.
      SET @sql = 'SELECT 1; this semicolon is inside a string';
      /* Block comments can also contain semicolons; safely. */
      CREATE TABLE demo (label VARCHAR(20));
    `);

    expect(statements).toHaveLength(2);
    expect(statements[0]).toContain('SELECT 1; this semicolon is inside a string');
    expect(statements[1]).toContain('CREATE TABLE demo');
  });

  it('supports MySQL hash comments and backtick-quoted identifiers', () => {
    const statements = splitSqlStatements(`
      # Another comment; still part of the first statement.
      SELECT \`value;name\` FROM demo;
      SELECT 1;
    `);

    expect(statements).toHaveLength(2);
    expect(statements[0]).toContain('value;name');
    expect(statements[1]).toBe('SELECT 1');
  });
});